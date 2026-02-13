import { createClient } from "@/utils/supabase/server";
import { TaskResolution } from "@/components/worker/task-resolution";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar } from "lucide-react";

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/worker/login");
    }

    const { data: task, error } = await supabase
        .from("complaints")
        .select("*, departments(name)")
        .eq("id", id)
        .single();

    if (!task || error) {
        return <div className="p-10 text-red-600">Task not found</div>;
    }

    return (
        <div className="container py-8 max-w-3xl">
            <h1 className="text-2xl font-bold mb-4">Task Details</h1>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-xl">{task.title}</CardTitle>
                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                <Badge variant="outline">{task.departments?.name}</Badge>
                                <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> {new Date(task.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <Badge className={task.status === 'completed' ? 'bg-green-600' : 'bg-blue-600'}>{task.status}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="font-semibold mb-2">Description</h3>
                        <p className="text-gray-700 bg-slate-50 p-3 rounded">{task.description}</p>
                    </div>

                    {task.image_url && (
                        <div>
                            <h3 className="font-semibold mb-2">Issue Photo</h3>
                            <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                                <Image
                                    src={task.image_url}
                                    alt="Issue"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <h3 className="font-semibold mb-2">Location</h3>
                        <div className="bg-slate-100 p-3 rounded flex items-center justify-between">
                            <div className="text-sm">
                                <p className="flex items-center"><MapPin className="h-4 w-4 mr-1 text-red-500" /> Latitude: {task.latitude}</p>
                                <p className="ml-5">Longitude: {task.longitude}</p>
                            </div>
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${task.latitude},${task.longitude}`}
                                target="_blank"
                                className="text-blue-600 text-sm hover:underline"
                            >
                                Open in Google Maps
                            </a>
                        </div>
                    </div>

                    <TaskResolution taskId={task.id} existingStatus={task.status} />

                </CardContent>
            </Card>
        </div>
    );
}
