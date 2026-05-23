export default async (request, context) => {
  const url = new URL(request.url);
  
  // Skip authentication for Devaki's folder
  if (url.pathname.startsWith("/devaki/")) {
    return context.next();
  }

  // Get the Authorization header from the request
  const auth = request.headers.get("Authorization");

  // Check if the Authorization header is missing
  if (!auth) {
    return new Response("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Briefs Studio Briefs"',
      },
    });
  }

  // Decode the Base64 credentials (format is "Basic username:password")
  const [scheme, encoded] = auth.split(" ");
  
  if (!encoded || scheme !== "Basic") {
    return new Response("Malformed Authorization header", { status: 400 });
  }

  const decoded = atob(encoded);
  const [username, password] = decoded.split(":");

  // Validate the password (we ignore the username for simplicity)
  // Password: 'Briefs Studio'
  if (password === "Briefs Studio") {
    return context.next();
  }

  // If password doesn't match, return 401 to prompt again
  return new Response("Forbidden", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Briefs Studio Briefs"',
    },
  });
};











