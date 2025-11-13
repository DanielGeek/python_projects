import PropTypes from 'prop-types';
import { Loader2Icon } from "lucide-react"

import { cn } from "@/utils"

function Spinner({
  className,
  ...props
}) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props} />
  );
}

Spinner.propTypes = {
  className: PropTypes.string
};

export { Spinner }
