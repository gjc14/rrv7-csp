# Before You Start

Generating `entry.server.tsx`
By default, React Router will handle generating the HTTP Response for you. You can reveal the default entry server file with the following:

```
npx react-router reveal
```

## Alternative: Generate and set headers in root `loader()`

```tsx
// root.tsx
export const headers = ({ loaderHeaders }: Route.HeadersArgs) => {
  return loaderHeaders;
};

export const loader = ({ context }: Route.LoaderArgs) => {
  const nonce = generateNonce();
  const headers = {
    [process.env.NODE_ENV === "production"
      ? "Content-Security-Policy"
      : "Content-Security-Policy-Report-Only"]: getContentSecurityPolicy(nonce),
    /** @see https://developer.mozilla.org/zh-TW/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security */
    "Strict-Transport-Security": "max-age=3600", // 1 hour. HTTPS only
    "X-Frame-Options": "SAMEORIGIN", // Prevent clickjacking
    "X-Content-Type-Options": "nosniff", // Prevent MIME type sniffing
  };
  context.set(nonceContext, nonce);
  return data({ nonce }, { headers });
};
```

and get the context in `entry.server.tsx` the same way:

```tsx
export default function handleRequest(props) {
  let nonce: string;

  try {
    // If root headers does not set, there will not be a nonce
    nonce = loadContext.get(nonceContext);
  } catch (error) {
    nonce = generateNonce();
    console.warn("No nonce found in context, generating a fallback.");
  }

  // ...
  const { pipe, abort } = renderToPipeableStream(
    <ServerRouter context={routerContext} url={request.url} nonce={nonce} />,
    //                                                      ^ pass nonce to <ServerRouter>
    {
      nonce, // and renderToPipeableStream
      // ...
    }
  );
  // ...
}
```

# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
