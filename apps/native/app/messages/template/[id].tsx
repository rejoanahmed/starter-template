import { TemplateDetailScreen } from "@app/components/pages/messages/TemplateDetailScreen";
import { useLocalSearchParams } from "expo-router";

export default function TemplateDetailRoute() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const templateId = Array.isArray(params.id) ? params.id[0] : params.id;

  return <TemplateDetailScreen templateId={templateId} />;
}
