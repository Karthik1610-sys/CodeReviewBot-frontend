'use client'

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Repo {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export default function RepoList() {
  const { data: session } = useSession();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  console.log("RepoList rendered");
  console.log("Session data:", session);
  console.log("Router object:", router);

  useEffect(() => {
    if (session) {
      console.log("Session is available, fetching repos...");
      const fetchRepos = async () => {
        const response = await fetch(`https://api.github.com/user/repos`, {
          headers: {
            Authorization: `token ${session.accessToken}`,
          },
        });
        const data = await response.json();
        console.log("Fetched repos:", data);
        setRepos(data);
        setLoading(false);
      };

      fetchRepos();
    } else {
      console.log("No session available");
    }
  }, [session]);

  if (loading) return <p>Loading repositories...</p>;
  // console.log(repos);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {repos.map((repo) => (
        <div 
          key={repo.id} 
          className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer" 
          onClick={() => {
            console.log(`Navigating to: /repo/${repo.name}`);
            router.push(`/repo/${repo.name}`);
          }}
        >
          <div className="flex items-center mb-2">
            <Image
              src={repo.owner.avatar_url}
              alt={repo.owner.login}
              width={40}
              height={40}
              className="rounded-full mr-2"
            />
            <span className="font-semibold">{repo.owner.login}</span>
          </div>
          <h3 className="text-lg font-bold mb-1">
            <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {repo.name}
            </a>
          </h3>
          <p className="text-gray-600">{repo.description || "No description available."}</p>
        </div>
      ))}
    </div>
  );
} 