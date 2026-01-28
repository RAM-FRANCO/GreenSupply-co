import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { CircularProgress, Container, Box } from "@mui/material";

export default function EditProductRedirect() {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      router.replace(
        {
          pathname: "/products",
          query: { action: "edit", id },
        },
        undefined,
        { shallow: true }
      );
    }
  }, [id, router]);

  return (
    <>
      <Head>
        <title>Redirecting... | GreenSupply Co.</title>
      </Head>
      <Container maxWidth="sm">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <CircularProgress />
        </Box>
      </Container>
    </>
  );
}
