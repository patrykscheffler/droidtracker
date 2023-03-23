import { ExternalLink, MoreHorizontal } from "lucide-react";
import Link from "next/link";

import { getLayout } from "~/components/layouts/AppLayout";
import { ButtonGroup } from "~/components/ui/ButtonGroup";
import Mattermost from "~/components/ui/icons/Mattermost";
import { Separator } from "~/components/ui/Separator";
import { Button } from "~/components/ui/Button";
import Meta from "~/components/ui/Meta";
import { api } from "~/utils/api";
import { env } from "~/env.mjs";

const SettingsView = () => {
  const { data: projects } = api.project.list.useQuery();

  return (
    <>
      <Meta title="Settings" />
      <div className="mx-auto max-w-3xl">
        <div className="mt-2 flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
          </div>
          <Button>
            <Mattermost className="mr-2 h-6 w-6 fill-white" /> Synchronize
          </Button>
        </div>
        <Separator className="my-4" />

        {projects && (
          <div className="mb-16 flex flex-col overflow-hidden rounded-md border border-gray-200 bg-white">
            {projects?.map((project) => (
              <div
                key={project.id}
                className="group flex w-full max-w-full items-center justify-between overflow-hidden border-b border-gray-200 px-4 py-4 last:border-0 hover:bg-gray-50 sm:px-6"
              >
                <div className="flex">
                  <Mattermost className="mr-2 h-6 w-6" />
                  <span className="text-sm font-semibold text-gray-700">
                    {project.name}
                  </span>
                </div>
                <div>
                  <ButtonGroup combined>
                    {project.externalId && (
                      <Link
                        href={`https://kamino.uniqsoft.pl/boards/team/kfeo6o8atbrmifyq9up91tm7rh/${project.externalId}`}
                        target="_blank"
                      >
                        <Button className="p-2" variant="outline">
                          <ExternalLink size="1rem" />
                        </Button>
                      </Link>
                    )}
                    <Button className="rounded-md p-2" variant="outline">
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

SettingsView.getLayout = getLayout;

export default SettingsView;
