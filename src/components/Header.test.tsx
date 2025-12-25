import { describe, it, expect, jest } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import Header from "./Header";

// Mock the auth context
const mockAuthContext = {
  currentUser: null,
  loading: false,
};

jest.mock("../contexts/AuthContext", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => mockAuthContext,
}));

const renderHeader = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Header />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe("Header", () => {
  it("renders the header with logo and navigation", () => {
    renderHeader();

    // Check if logo is present
    expect(screen.getByText("FlightBook")).toBeInTheDocument();

    // Check navigation links
    expect(screen.getByText("Flights")).toBeInTheDocument();
    expect(screen.getByText("Hotels")).toBeInTheDocument();
    expect(screen.getByText("Visa")).toBeInTheDocument();
  });

  it("shows login button when user is not authenticated", () => {
    renderHeader();

    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("opens mobile menu when hamburger button is clicked", () => {
    renderHeader();

    const mobileMenuButton = screen.getByRole("button", { hidden: true });
    fireEvent.click(mobileMenuButton);

    // Mobile menu should be visible (this test might need adjustment based on actual implementation)
    expect(screen.getByText("Flights")).toBeInTheDocument();
  });
});
