import BarcLogo from "~/assets/barc.svg";
import { Button, Stack } from "~/components";
import { Stats } from "./Stats";

export function Footer() {
  return (
    <Stack justify="between" align="center" className="p-4 bg-slate-800 text-slate-100">
      <Stack align="center">
        <Stats />
        <Stack direction="col">
          <Button className="mt-2 min-w-24">Help</Button>
          <Button className="mt-2 min-w-24">Settings</Button>
        </Stack>
      </Stack>

      <img src={BarcLogo} alt="Barc Logo" className="pr-4" width="280px" />
    </Stack>
  );
}
