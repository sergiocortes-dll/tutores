import React from "react";
import { useAuth } from "../context/AuthContext";

const Dashboard: React.FC = () => {
  const { session, user, signOut } = useAuth();

  if (!session) {
    return <div>No active session. Please log in.</div>;
  }

  console.log(user)

  return (
    <div>
      <h1>Current Session</h1>
      <p>User ID: {user?.id}</p>
      <p>Email: {user?.email}</p>
      <p>Role: {/* Fetch from profiles if needed */}</p>
      <pre>{JSON.stringify(session, null, 2)}</pre>{" "}
      {/* Full session for debugging */}
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
};

export default Dashboard;
