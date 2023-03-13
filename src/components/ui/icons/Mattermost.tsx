import React from 'react';

type Props = {
  className?: string
}

const Mattermost = ({ className }: Props) => (
  <svg
    width="700"
    height="700"
    viewBox="0 0 700 700"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M496.909 147.716L499.54 200.779C542.559 248.303 559.539 315.609 538.125 378.865C506.159 473.292 400.753 522.93 302.694 489.735C204.635 456.54 151.057 353.081 183.023 258.653C204.508 195.186 259.171 151.953 322.48 140.505L356.685 100.091C249.969 97.2018 149.288 163.442 113.265 269.853C69.0048 400.598 139.114 542.468 269.859 586.729C400.604 630.99 542.474 560.88 586.735 430.135C622.7 323.895 583.148 210.308 496.909 147.716Z"
      fill="#222222"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M435.623 304.289L433.812 230.109L432.359 187.424L431.376 150.444C431.376 150.444 431.581 132.612 430.959 128.422C430.828 127.54 430.551 126.822 430.221 126.196C430.18 126.108 430.141 126.02 430.096 125.934C430.049 125.854 430.003 125.78 429.954 125.705C429.27 124.528 428.195 123.572 426.804 123.101C425.381 122.619 423.909 122.738 422.631 123.29C422.604 123.3 422.579 123.309 422.552 123.32C422.4 123.388 422.255 123.465 422.109 123.546C421.503 123.841 420.887 124.223 420.284 124.808C417.244 127.758 406.575 142.048 406.575 142.048L383.331 170.826L356.248 203.851L309.749 261.677C309.749 261.677 288.411 288.308 293.126 321.088C297.841 353.868 322.211 369.837 341.117 376.238C360.023 382.638 389.082 384.756 412.74 361.581C436.396 338.405 435.623 304.289 435.623 304.289Z"
      fill="#222222"
    />
  </svg>
);

export default Mattermost;
