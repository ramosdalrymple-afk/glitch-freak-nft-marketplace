import { Card } from "../ui/Card";

interface NFTCardProps {
  name: string;
  price: string;
  imageUrl?: string;
}

export const NFTCard = ({ name, price, imageUrl }: NFTCardProps) => {
  return (
    <Card>
      <div style={{
        width: "0%",
        aspectRatio: "1/1",
        backgroundColor: "#222",
        borderRadius: "8px",
        marginBottom: "16px",
        overflow: "hidden"
      }}>
        {imageUrl ? <img src={imageUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : 
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#444" }}>No Image</div>}
      </div>
      <h4 style={{ margin: "0 0 8px 0", fontSize: "16px" }}>{name}</h4>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#888", fontSize: "14px" }}>Price</span>
        <span style={{ fontWeight: "bold", color: "#00d1ff" }}>{price} SUI</span>
      </div>
      <button style={{
        width: "100%",
        marginTop: "16px",
        padding: "10px",
        borderRadius: "8px",
        border: "none",
        backgroundColor: "#00d1ff",
        color: "#000",
        fontWeight: "bold",
        cursor: "pointer"
      }}>
        Buy Now
      </button>
    </Card>
  );
};