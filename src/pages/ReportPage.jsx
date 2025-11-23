import React, {useEffect, useState} from "react";
import { DatePicker, Space, Table, message, Card } from "antd";
import { reportService } from "../api/reportService";
import { Line } from "@ant-design/plots";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

export default function ReportPage() {
    const [summary, setSummary] = useState([]);
    const [overdue, setOverdue] = useState([]);
    const [loading, setLoading] = useState(false);

    const now = dayjs();
    const defaultStart = now.startOf("month");
    const defaultEnd = now.endOf("month");

    const [range, setRange] = useState([defaultStart, defaultEnd]);

    useEffect(() => {
        fetchReport(defaultStart, defaultEnd);
    }, []);

    const fetchReport = async (start, end) => {
        setLoading(true);
        try {
            const s = dayjs(start).format("YYYY-MM-DD");
            const e = dayjs(end).format("YYYY-MM-DD");

            const summaryData = await reportService.getSummaryRange(s, e);
            const overdueData = await reportService.getOverdueRange(s, e);

            setSummary(summaryData);
            setOverdue(overdueData);
        } catch (err) {
            console.error(err);
            message.error("Không thể tải báo cáo!");
        } finally {
            setLoading(false);
        }
    };

    const columnsSummary = [
        { title: "Ngày", dataIndex: "reportDate" },
        { title: "Đang mượn", dataIndex: "totalBorrowed" },
        { title: "Quá hạn", dataIndex: "totalOverdue" },
        { title: "Đã trả", dataIndex: "totalReturned" },
        { title: "Tiền phạt", dataIndex: "totalFeeEstimate" },
    ];

    const columnsOverdue = [
        { title: "Ngày", dataIndex: "reportDate" },
        { title: "Mã SV", dataIndex: "studentId" },
        { title: "Mã sách", dataIndex: "bookId" },
        { title: "LoanID", dataIndex: "loanId" },
        { title: "Ngày mượn", dataIndex: "borrowDate" },
        { title: "Ngày hết hạn", dataIndex: "dueDate" },
        { title: "Ngày quá hạn", dataIndex: "daysOverdue" },
        { title: "Tiền phạt", dataIndex: "estimatedFee" },
    ];

    const chartData = summary.map((s) => ({
        date: s.reportDate,
        borrowed: s.totalBorrowed,
        overdue: s.totalOverdue,
    }));

    const config = {
        data: chartData,
        xField: "date",
        yField: "borrowed",
        smooth: true,
        height: 250,
        seriesField: "type",
    };

    return (
        <div>
            <Space style={{ marginBottom: 16 }}>
                <RangePicker
                    value={range}
                    onChange={(dates) => {
                        if (dates) {
                            setRange(dates);
                            fetchReport(dates[0], dates[1]);
                        }
                    }}
                />
            </Space>

            <Card title="Biểu đồ số lượng sách đang mượn theo ngày" style={{ marginBottom: 20 }}>
                <Line {...config} />
            </Card>

            <Card title="Thống kê tổng hợp" style={{ marginBottom: 20 }}>
                <Table
                    rowKey="reportDate"
                    columns={columnsSummary}
                    dataSource={summary}
                    loading={loading}
                    pagination={false}
                />
            </Card>

            <Card title="Danh sách sinh viên quá hạn">
                <Table
                    rowKey={(r) => `${r.reportDate}-${r.loanId}`}
                    columns={columnsOverdue}
                    dataSource={overdue}
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    );
}
