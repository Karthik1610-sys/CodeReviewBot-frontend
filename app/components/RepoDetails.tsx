'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

interface Repository {
  github_id: number;
  name: string;
}

interface Issue {
  category: string;
  severity: string;
  description: string;
  file_path: string;
  line_number: number;
}

interface Review {
  content: string;
  status: string;
}

interface PullRequest {
  number: number;
  title: string;
  description: string;
  status: string;
  created_at: string;
  merged_at: string | null;
  review: Review;
  issues: Issue[];
}

export default function RepoDetails() {
  const router = useRouter();
  const { repoName } = router.query; // Get the repo name from the query
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(true);

  console.log("RepoDetails rendered");
  console.log("Repo name from query:", repoName);

  useEffect(() => {
    if (repoName) {
      console.log("Fetching data for repo:", repoName);
      const fetchData = async () => {
        const pullRequestsResponse = await fetch(`http://localhost:3000/api/repositories/${repoName}/`);
        const pullRequestsData = await pullRequestsResponse.json();

        console.log("Fetched pull requests:", pullRequestsData);

        setPullRequests(pullRequestsData.pull_requests);
        setLoading(false);
      };

      fetchData();
    } else {
      console.log("No repo name available");
    }
  }, [repoName]);

  if (loading) return <p>Loading...</p>;

  // Sort pull requests by created_at in descending order
  const sortedPullRequests = pullRequests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

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
            <h4>Review:</h4>
            <p>Content: {pr.review.content}</p>
            <p>Status: {pr.review.status}</p>
            <button
              onClick={() => {
                const issueList = document.getElementById(`issues-${pr.number}`);
                if (issueList) {
                  issueList.classList.toggle("hidden");
                }
              }}
              className="mt-2 text-blue-600 hover:underline"
            >
              {pr.issues.length > 0 ? "Toggle Issues" : "No Issues"}
            </button>
            <ul id={`issues-${pr.number}`} className="hidden mt-2">
              {pr.issues.map(issue => (
                <li key={issue.line_number} className="border-b py-1">
                  <p>Category: {issue.category}</p>
                  <p>Severity: {issue.severity}</p>
                  <p>Description: {issue.description}</p>
                  <p>File Path: {issue.file_path}</p>
                  <p>Line Number: {issue.line_number}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
} 