import * as React from 'react';

import {cn} from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({className, ...props}, ref) => {
    return (
    
    const TableCell = React.forwardRef<
      HTMLTableCellElement,
      React.TdHTMLAttributes<HTMLTableCellElement>
    >(({ className, ...props }, ref) => (
      <td
        ref={ref}
        className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
        {...props}
      />
    ))
    TableCell.displayName = "TableCell"
    
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export {Textarea};
