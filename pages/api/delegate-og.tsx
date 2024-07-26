import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

export default async function handler() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <svg width="600" height="600" viewBox="-27 -28 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_1_39960)">
              <path
                d="M31.882 0L19.4018 7.1676V29.5381L12.5158 33.5297L5.58775 29.5349V21.5482L12.5158 17.5921L16.9705 20.1755V13.7136L12.477 11.1626L0 18.4111V32.7496L12.5191 39.9593L24.996 32.7496V10.3824L31.924 6.3874L38.8489 10.3824V18.3334L31.924 22.364L27.4306 19.7579V26.1873L31.882 28.7545L44.482 21.587V7.1676L31.882 0Z"
                fill="#6C00F6"
              />
            </g>
          </svg>
        </div>
      </div>
    ),
    {
      width: 600,
      height: 600,
    }
  );
}
