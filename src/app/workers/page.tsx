"use client"

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
import { PlusIcon } from "lucide-react";
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
            </div>
        </CardHeader>
        <CardContent>
            <div className="mb-5">
                <input
                type="text"
                placeholder="Name"
                value={newWorker.name}
                onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                className="mr-2 p-2 border rounded"
                />
                <input
                type="email"
                placeholder="Email"
                value={newWorker.email}
                onChange={(e) => setNewWorker({ ...newWorker, email: e.target.value })}
                className="mr-2 p-2 border rounded"
                />
                <Button onClick={createWorker}>Add Worker</Button>
            </div>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {workers.map((worker) => (
                    <TableRow key={worker._id}>
                    <TableCell>{worker.name}</TableCell>
                    <TableCell>{worker.email}</TableCell>
                    <TableCell>
                        <Button variant="destructive" onClick={() => deleteWorker(worker._id)}>
                        Delete
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