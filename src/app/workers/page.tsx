"use client"

import { NewWorkerModal } from "@/components/new-worker-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Worker {
  _id: string;
  name: string;
  email: string;
}

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [newWorker, setNewWorker] = useState({ name: "", email: "" });

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    const response = await fetch("/api/worker");
    const data = await response.json();
    setWorkers(data);
  };

  const createWorker = async () => {
    const response = await fetch("/api/worker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newWorker),
    });
    if (response.ok) {
      setNewWorker({ name: "", email: "" });
      fetchWorkers();
    }
  };

  const deleteWorker = async (id: string) => {
    const response = await fetch(`/api/worker?id=${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      fetchWorkers();
    }
  };

  return (
    <Card>
        <CardHeader>
            <div className="flex justify-between items-center mb-6">
                <CardTitle>Workers</CardTitle>
                <NewWorkerModal onWorkerAdded={fetchWorkers} />
            </div>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {workers.map((worker) => (
                    <TableRow key={worker._id}>
                    <TableCell>{worker.name}</TableCell>
                    <TableCell>{worker.email}</TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => deleteWorker(worker._id)}>
                            <TrashIcon className="h-4 w-4" />
                        </Button>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
  );
}