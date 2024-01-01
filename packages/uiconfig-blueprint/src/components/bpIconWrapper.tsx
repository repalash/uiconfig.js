// https://github.com/palantir/blueprint/issues/2348#issuecomment-389322440
import {ReactNode} from "react";

export const bpIconWrapper = (path: ReactNode, viewbox = 16) => {
    return (
        <span className="bp5-icon">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0"
                y="0"
                width="16"
                height="16"
                role="img"
                viewBox={`0 0 ${viewbox} ${viewbox}`}
            >
                {path}
            </svg>
        </span>
    );
};
