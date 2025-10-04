import CrudTable from "../components/CrudTable";
import { bookService } from "../api/bookService";

export default function BookPage() {
    const columns = [
        { title: "Mã sách", dataIndex: "code" },
        { title: "Tên sách", dataIndex: "name" },
        { title: "Tác giả", dataIndex: "author" },
        { title: "Thể loại", dataIndex: "category" },
    ];
    return <CrudTable title="sách" columns={columns} api={bookService} />;
}
