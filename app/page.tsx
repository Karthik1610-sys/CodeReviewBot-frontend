'use client'

import { useSession } from "next-auth/react";
import RepoList from "./components/RepoList";

export default function Home() {
  const { data: session } = useSession();
  console.log("Home component rendered");

  return (
    <>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      {!session ? (
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Connect your GitHub account to get started
        </p>
      ) : (
        <RepoList />
      )}
    </>
  );
}
