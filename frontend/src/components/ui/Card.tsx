import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  title?: string;
}

export const Card = ({ children, title }: CardProps) => {
  return (
    <div style={{
      backgroundColor: "#141414",
      border: "1px solid #262626",
      borderRadius: "16px",
      padding: "24px",
      transition: "transform 0.2s ease, border-color 0.2s ease",
    }}>
      {title && <h3 style={{ marginTop: 0, marginBottom: "16px", fontSize: "18px" }}>{title}</h3>}
      {children}
    </div>
  );
};