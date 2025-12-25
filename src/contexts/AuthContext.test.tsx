import { describe, it, expect, jest } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";

// Mock Firebase
jest.mock("../firebase", () => ({
  app: {},
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({})),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null); // Simulate no user logged in
    return jest.fn(); // Return unsubscribe function
  }),
}));

// Test component that uses the auth context
const TestComponent = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {currentUser ? (
        <div data-testid="user-info">
          <p>Logged in as: {currentUser.email}</p>
        </div>
      ) : (
        <div data-testid="no-user">No user logged in</div>
      )}
    </div>
  );
};

describe("AuthContext", () => {
  it("provides auth context to child components", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Should show loading initially
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    // Should show no user after loading
    await waitFor(() => {
      expect(screen.getByTestId("no-user")).toBeInTheDocument();
    });
  });

  it("throws error when useAuth is used outside provider", () => {
    // Mock console.error to avoid noise in test output
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow(
      "useAuth must be used within an AuthProvider"
    );

    consoleSpy.mockRestore();
  });
});
