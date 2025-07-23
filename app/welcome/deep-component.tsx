import { useEffect } from "react";
import { useHydrated } from "~/hooks/use-hydrated";
import { useNonce } from "~/hooks/use-nonce";

/**
 * Browser will crear all nonce before javascript execution.
 * Therefore, nonce should be applied after hydration.
 *
 * @see https://github.com/kentcdodds/nonce-hydration-issues
 */
export function InlineDemo() {
  const nonce = useNonce();
  const isHydrated = useHydrated();

  const safeNonce = isHydrated ? nonce : undefined;

  useEffect(() => {
    if (isHydrated && nonce) {
      const script = document.createElement("script");
      // Try to comment the next line to see if it works without nonce
      script.nonce = nonce;
      script.text = "alert('inline script!')";
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [isHydrated, nonce]);

  return (
    <>
      {safeNonce && (
        <style nonce={safeNonce}>{`
            .btn {
              background-color: red; /* Red */
              border: yellow dashed 3px; /* Black border */
              border-radius: 12px; /* Rounded corners */
              color: white;
              padding: 15px 32px;
              text-align: center;
              cursor: pointer;
            }
        `}</style>
      )}
      <button
        className="btn flex mx-auto"
        onClick={() => alert("Button clicked!")}
      >
        Click Me
      </button>
    </>
  );
}
