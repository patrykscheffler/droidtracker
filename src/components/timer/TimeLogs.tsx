import React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { startOfWeek, endOfWeek } from "date-fns";
import { type DateRange } from "react-day-picker";

import { DataTable } from "~/components/ui/DataTable";
import { DatePickerWithRange } from "../ui/DatePickerWithRange";

export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
];

export default function TimeLogs() {
  const [date, setDate] = React.useState<DateRange | undefined>(() => {
    const today = new Date();
    const from = startOfWeek(today);
    const to = endOfWeek(today);

    return {
      from,
      to,
    };
  });

  const data: Payment[] = [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <DatePickerWithRange selected={date} onSelect={setDate} />
      <DataTable columns={columns} data={data} />
    </div>
  );
}
