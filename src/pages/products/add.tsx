import { useEffect } from "react";
import { useRouter } from "next/router";
import { CircularProgress, Box } from "@mui/material";

export default function AddProduct() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to products page with add action
    router.replace("/products?action=add");
  }, [router]);

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
      <CircularProgress />
    </Box>
  );
}
