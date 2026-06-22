
export default function EmptyTable({ searchTerm, colSpan = 10, tableType }: { searchTerm: string; colSpan: number, tableType: string }) {
    return (
        <tr>
            <td colSpan={colSpan} className="p-8 text-center text-gray-500">
                {searchTerm ? `No ${tableType} found matching your search.` : `No ${tableType} found.`}
            </td>
        </tr>
    )
}
