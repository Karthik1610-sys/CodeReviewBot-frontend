'use client'

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

interface Repository {
  github_id: number;
  name: string;
}

interface Issue {
  id: number;
  category: string;
  severity: string;
  description: string;
  file_path: string;
  line_number: number;
}

interface Review {
  content: string;
  status: string;
  issues: Issue[];
}

interface PullRequest {
  number: number;
  title: string;
  description: string;
  status: string;
  created_at: string;
  merged_at: string | null;
  review: Review;
}

export default function RepoDetails() {
  const { repoName } = useParams();
  const { data: session } = useSession();
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(true);

  console.log("RepoDetails rendered");
  console.log("Repo name from params:", repoName);
  console.log("Session:", session);

  useEffect(() => {
    if (repoName && session?.accessToken) {
      console.log("Fetching data for repo:", repoName);
      const fetchData = async () => {
        try {
          const pullRequestsResponse = await fetch(`/api/repositories/${repoName}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            }
          });
          
          if (!pullRequestsResponse.ok) {
            throw new Error(`HTTP error! status: ${pullRequestsResponse.status}`);
          }
          
          const pullRequestsData = await pullRequestsResponse.json();
          console.log("Fetched pull requests:", pullRequestsData);
          setPullRequests(pullRequestsData.pull_requests || []);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    } else {
      console.log("No repo name or session available");
      setLoading(false);
    }
  }, [repoName, session]);

  if (loading) return <p>Loading...</p>;

  if (!session) {
    return <p>Please sign in to view repository details.</p>;
  }

  // Sort pull requests by created_at in descending order
  const sortedPullRequests = pullRequests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  console.log("Sorted pull requests:", sortedPullRequests);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Pull Requests for {repoName}</h1>
      <h2 className="text-xl font-semibold mb-2">Pull Requests</h2>
      <div className="space-y-4">
        {sortedPullRequests.map(pr => (
          <div key={pr.number} className="border rounded-lg p-4 shadow-md">
            <h3 className="font-bold">{pr.title}</h3>
            <p>{pr.description}</p>
            <p>Status: {pr.status}</p>
            <p>Created At: {pr.created_at}</p>
            <p>Merged At: {pr.merged_at}</p>
            <p>Review: {pr.review.content}</p>
            <button
              onClick={() => {
                const issueList = document.getElementById(`issues-${pr.number}`);
                if (issueList) {
                  issueList.classList.toggle("hidden");
                }
              }}
              className="mt-2 text-blue-600 hover:underline"
            >
              {pr.review.issues.length > 0 ? "Toggle Issues" : "No Issues"}
            </button>
            <ul id={`issues-${pr.number}`} className="hidden mt-2">
              {pr.review.issues.map((issue, index) => (
                <li key={`${pr.number}-${issue.file_path}-${issue.line_number}-${index}`} className="border-b py-1">
                  <p>Category: {issue.category}</p>
                  <p>Severity: {issue.severity}</p>
                  <p>Description: {issue.description}</p>
                  {/* <p>File Path: {issue.file_path}</p>
                  <p>Line Number: {issue.line_number}</p> */}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
} 