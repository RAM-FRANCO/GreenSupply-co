import { useEffect } from "react";
import { useRouter } from "next/router";
import { CircularProgress, Box } from "@mui/material";

export default function EditWarehouseRedirect() {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      // Redirect to the warehouses list with the edit action query param
      router.replace({
        pathname: "/warehouses",
        query: { action: "edit", id },
      });
    }
  }, [id, router]);

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
      <CircularProgress />
    </Box>
  );
}

