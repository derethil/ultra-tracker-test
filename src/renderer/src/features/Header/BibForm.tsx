import { Stack, Button, TextInput } from "~/components";
import { usePingPongMutation } from "~/hooks/usePingPongMutation";
import { useToasts } from "../Toasts/useToasts";

export function BibForm() {
  const clickInMutation = usePingPongMutation();
  const { createToast } = useToasts();

  const clickInHandler = () => {
    createToast({ message: "Sending ping...", type: "error" });
    clickInMutation.mutate("ping from the renderer!");
  };

  return (
    <Stack align="stretch">
      <TextInput className="m-1.5 w-32" type="number" placeholder="Bib #" size="lg" outline />
      <Stack direction="col">
        <Button className="m-1.5 mb-0 min-w-24" color="success" size="lg" onClick={clickInHandler}>
          In
        </Button>
        <Button className="m-1.5 min-w-24" color="error" size="lg">
          Out
        </Button>
      </Stack>
    </Stack>
  );
}
