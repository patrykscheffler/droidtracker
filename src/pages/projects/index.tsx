import { ExternalLink, MoreHorizontal } from "lucide-react";

import { getLayout } from "~/components/layouts/AppLayout";
import { ButtonGroup } from "~/components/ui/ButtonGroup";
import Mattermost from "~/components/ui/icons/Mattermost";
import { Separator } from "~/components/ui/Separator";
import { Button } from "~/components/ui/Button";
import Meta from "~/components/ui/Meta";
import { api } from "~/utils/api";
import { env } from "~/env.mjs";
import { useToast } from "~/lib/hooks/useToast";
import { useRouter } from "next/router";
import { formatDuration } from "~/lib/utils";

const ProjectsView = () => {
  const router = useRouter();
  const { toast } = useToast();
  const utils = api.useContext();
  const { data: projects } = api.project.getAllWithDurations.useQuery();
  const { mutate: sync } = api.project.sync.useMutation({
    onSuccess: async () => {
      await utils.project.getAllWithDurations.invalidate();
      toast({ title: "Projects synchronized", variant: "success" });
    },
  });

  return (
    <>
      <Meta title="Projects" />
      <div className="mx-auto max-w-3xl">
        <div className="mt-2 flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
          </div>
          <Button onClick={() => sync()}>
            <Mattermost className="mr-2 h-6 w-6 fill-white" /> Synchronize
          </Button>
        </div>
        <Separator className="my-4" />

        {projects && (
          <div className="mb-16 flex flex-col overflow-hidden rounded-md border border-gray-200 bg-white">
            {projects?.map((project) => (
              <div
                key={project.id}
                onClick={() => router.push(`/projects/${project.id}`)}
                className="group flex w-full max-w-full cursor-pointer items-center justify-between overflow-hidden border-b border-gray-200 px-4 py-4 last:border-0 hover:bg-gray-50 sm:px-6"
              >
                <div className="flex">
                  <Mattermost className="mr-2 h-6 w-6" />
                  <span className="text-sm font-semibold text-gray-700">
                    {project.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{formatDuration(project.duration)}</span>
                  <ButtonGroup combined>
                    {project.externalId && (
                      <Button
                        href={`${
                          env.NEXT_PUBLIC_MATTERMOST_URL ?? ""
                        }/boards/team/${
                          env.NEXT_PUBLIC_MATTERMOST_TEAM ?? ""
                        }/${project.externalId}`}
                        variant="icon"
                        size="sm"
                      >
                        <ExternalLink size="1rem" />
                      </Button>
                    )}
                    <Button variant="icon" size="sm">
                      <MoreHorizontal size="1rem" />
                    </Button>
                  </ButtonGroup>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

ProjectsView.getLayout = getLayout;

export default ProjectsView;
