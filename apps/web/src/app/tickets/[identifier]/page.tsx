import { TicketDetail } from "@/components/ticket-detail";

export default function TicketDetailPage({ params }: { params: { identifier: string } }) {
  return <TicketDetail identifier={params.identifier} />;
}
