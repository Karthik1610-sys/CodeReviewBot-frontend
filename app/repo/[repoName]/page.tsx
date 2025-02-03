'use client'

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";

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
  html_url: string;
}

function formatDateTime(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
}

export default function RepoDetails() {
  const { repoName } = useParams();
  const { data: session } = useSession();
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPRs, setExpandedPRs] = useState<Record<number, boolean>>({});

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

  const toggleIssues = (prNumber: number) => {
    setExpandedPRs(prev => ({
      ...prev,
      [prNumber]: !prev[prNumber]
    }));
  };

  if (loading) return <p>Loading...</p>;

  if (!session) {
    return <p>Please sign in to view repository details.</p>;
  }

  // Sort pull requests by created_at in descending order
  const sortedPullRequests = pullRequests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  console.log("Sorted pull requests:", sortedPullRequests);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Image
          src={session?.user?.image ?? '/github-mark.svg'}
          alt={session?.user?.name ?? 'User'}
          width={40}
          height={40}
          className="rounded-full"
        />
        <a
          href={`https://github.com/${session?.user?.name}/${repoName}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-2xl font-bold hover:underline"
        >
          {session?.user?.name}/{repoName}
        </a>
      </div>
      <h2 className="text-xl font-semibold mb-4">Pull Requests</h2>
      
      {sortedPullRequests.length === 0 ? (
        <div className="border rounded-lg p-12 shadow-md text-center">
          <div className="flex flex-col items-center gap-4">
            <svg 
              className="w-16 h-16 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
            <h3 className="text-xl font-medium text-gray-600">No Pull Requests Yet</h3>
            <p className="text-gray-500">This repository doesn't have any pull requests at the moment.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedPullRequests.map(pr => (
            <div key={pr.number} className="border rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xl">{pr.title}</h3>
                <a
                  href={pr.html_url || `https://github.com/${session?.user?.name}/${repoName}/pull/${pr.number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <Image
                    src="/github-mark.svg"
                    alt="View on GitHub"
                    width={20}
                    height={20}
                    className="dark:invert"
                  />
                  <span className="text-sm">View on GitHub</span>
                </a>
              </div>

              <div className="mb-4">
                <p className="text-gray-600">{pr.description}</p>
              </div>

              <div className="flex items-center gap-6 mb-4 text-sm">
                <div className={`px-3 py-1 rounded-full ${
                  pr.status === 'open' ? 'bg-green-100 text-green-800' :
                  pr.status === 'closed' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {pr.status}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Created {formatDateTime(pr.created_at)}</span>
                </div>
                {pr.merged_at && (
                  <div className="flex items-center gap-2 text-purple-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <span>Merged {formatDateTime(pr.merged_at)}</span>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2 text-gray-700 dark:text-gray-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-medium">Review Comments</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">{pr.review.content}</p>
              </div>

              <button
                onClick={() => toggleIssues(pr.number)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">Issues</span>
                  <span className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-600 rounded-full">
                    {pr.review.issues.length}
                  </span>
                </div>
                <span
                  className={`transition-transform duration-200 ${
                    expandedPRs[pr.number] ? 'rotate-180' : ''
                  }`}
                >
                  ▼
                </span>
              </button>

              <div
                className={`transition-all duration-200 overflow-hidden ${
                  expandedPRs[pr.number] ? 'max-h-[1000px] mt-4' : 'max-h-0'
                }`}
              >
                <ul className="space-y-3">
                  {pr.review.issues.map((issue, index) => (
                    <li
                      key={`${pr.number}-${issue.file_path}-${issue.line_number}-${index}`}
                      className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-sm rounded-full ${
                          issue.severity === 'high' ? 'bg-red-100 text-red-800' :
                          issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {issue.severity}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">{issue.category}</span>
                      </div>
                      <p className="text-gray-800 dark:text-gray-200">{issue.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 