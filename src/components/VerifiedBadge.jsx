export default function VerifiedBadge({ size = "small" }) {
  const sizes = {
    small: {
      width: "16px",
      height: "16px",
      checkSize: "10px",
    },
    medium: {
      width: "20px",
      height: "20px",
      checkSize: "12px",
    },
    large: {
      width: "24px",
      height: "24px",
      checkSize: "14px",
    },
  };

  const sizeConfig = sizes[size] || sizes.small;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: sizeConfig.width,
        height: sizeConfig.height,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #1877f2 0%, #1565c0 100%)",
        boxShadow: "0 2px 8px rgba(24, 119, 242, 0.4)",
        padding: "2px",
        position: "relative",
      }}
      title="Verified Account"
    >
      {/* Outer ring for depth */}
      <div
        style={{
          position: "absolute",
          inset: "0",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #1877f2 0%, #1565c0 100%)",
          opacity: "0.1",
          boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.3)",
        }}
      />

      {/* Inner circle background */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #1877f2 0%, #1565c0 100%)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Checkmark SVG */}
        <svg
          width={sizeConfig.checkSize}
          height={sizeConfig.checkSize}
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            filter: "drop-shadow(0 1px 1px rgba(0, 0, 0, 0.2))",
          }}
        >
          <path
            d="M16.7071 5.70711C17.0976 5.31658 17.0976 4.68342 16.7071 4.29289C16.3166 3.90237 15.6834 3.90237 15.2929 4.29289L8 11.5858L4.70711 8.29289C4.31658 7.90237 3.68342 7.90237 3.29289 8.29289C2.90237 8.68342 2.90237 9.31658 3.29289 9.70711L7.29289 13.7071C7.68342 14.0976 8.31658 14.0976 8.70711 13.7071L16.7071 5.70711Z"
            fill="white"
          />
        </svg>
      </div>

      {/* Shine effect */}
      <div
        style={{
          position: "absolute",
          top: "1px",
          left: "1px",
          width: "40%",
          height: "40%",
          background: "rgba(255, 255, 255, 0.3)",
          borderRadius: "50%",
          zIndex: 2,
        }}
      />
    </div>
  );
}
