import Header from "./components/Header";
import RepoList from "./components/RepoList";

export default function Home() {
  console.log("Home component rendered");
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-6">
        {/* Dashboard content will go here */}
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connect your GitHub account to get started
          </p>
          <RepoList />
        </div>
      </main>
    </div>
  );
}
