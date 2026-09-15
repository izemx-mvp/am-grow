export function Logo({ className = "h-10 w-auto" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="120 120 420 290"
      role="img"
      aria-label="amg farms logo"
      className={className}
    >
      <g transform="translate(320,300) skewX(-6)">
        <text
          x="0"
          y="0"
          fontFamily="Poppins, sans-serif"
          fontWeight="700"
          fontSize="150"
          fill="#1F5039"
          textAnchor="middle"
          letterSpacing="2"
        >
          amg
        </text>
      </g>
      <g transform="translate(418,158) scale(0.75)">
        <path
          d="M0,46 C0,46 -3,18 14,4 C31,-10 46,0 46,0 C46,0 44,26 28,38 C15,48 0,46 0,46 Z"
          fill="#E7B84C"
        />
        <path
          d="M6,44 C10,30 18,16 30,6"
          stroke="#1F5039"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
      </g>
      <text
        x="320"
        y="378"
        fontFamily="Poppins, sans-serif"
        fontWeight="600"
        fontSize="34"
        fill="#9CA3A0"
        textAnchor="middle"
        letterSpacing="10"
      >
        FARMS
      </text>
    </svg>
  );
}

export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="380 140 110 110"
      role="img"
      aria-label="amg farms"
      className={className}
    >
      <g transform="translate(400,150) scale(1.3)">
        <path
          d="M0,46 C0,46 -3,18 14,4 C31,-10 46,0 46,0 C46,0 44,26 28,38 C15,48 0,46 0,46 Z"
          fill="#E7B84C"
        />
        <path
          d="M6,44 C10,30 18,16 30,6"
          stroke="#1F5039"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
