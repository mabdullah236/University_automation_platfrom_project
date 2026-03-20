
import React from 'react';

interface TableProps {
    children: React.ReactNode;
    className?: string;
}

const Table: React.FC<TableProps> = ({ children, className }) => {
    return (
        <div className="relative w-full overflow-auto rounded-xl border border-slate-700/50">
            <table className={`w-full caption-bottom text-sm ${className}`}>
                {children}
            </table>
        </div>
    );
};

// Fix: Updated props to accept standard HTML attributes
export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className, ...props }) => (
    <thead className={`[&_tr]:border-b [&_tr]:border-slate-700 ${className}`} {...props}>
        {children}
    </thead>
);

// Fix: Updated props to accept standard HTML attributes
export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className, ...props }) => (
    <tbody className={`[&_tr:last-child]:border-0 ${className}`} {...props}>
        {children}
    </tbody>
);

// Fix: Updated props to accept standard HTML attributes
export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ children, className, ...props }) => (
    <tr className={`border-b border-slate-800 transition-colors hover:bg-slate-800/50 ${className}`} {...props}>
        {children}
    </tr>
);

// Fix: Updated props to accept standard HTML attributes, including colSpan
export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ children, className, ...props }) => (
    <th className={`h-12 px-4 text-left align-middle font-medium text-slate-400 [&:has([role=checkbox])]:pr-0 ${className}`} {...props}>
        {children}
    </th>
);

// Fix: Updated props to accept standard HTML attributes, including colSpan
export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ children, className, ...props }) => (
    <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`} {...props}>
        {children}
    </td>
);

export default Table;
