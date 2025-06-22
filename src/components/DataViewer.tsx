import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, Eye, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface DataRecord {
  id: number;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  amount: number;
  date: string;
  status: 'clean' | 'flagged' | 'corrected';
  confidence: number;
  issues?: string[];
}

const mockData: DataRecord[] = [
  {
    id: 1,
    customerName: "John Smith",
    email: "john.smith@email.com",
    phone: "+1-555-123-4567",
    address: "123 Main Street, New York, NY 10001",
    amount: 1250.50,
    date: "2024-01-15",
    status: "clean",
    confidence: 98
  },
  {
    id: 2,
    customerName: "jane doe",
    email: "JANE.DOE@GMAIL.COM",
    phone: "(555) 987-6543",
    address: "456 oak st",
    amount: 890.25,
    date: "2024-01-14",
    status: "corrected",
    confidence: 85,
    issues: ["Name formatting", "Address standardization"]
  },
  {
    id: 3,
    customerName: "Bob Johnson",
    email: "bob@company",
    phone: "555.456.7890",
    address: "789 Pine Avenue, Los Angeles, CA",
    amount: 2100.00,
    date: "2024-01-13",
    status: "flagged",
    confidence: 65,
    issues: ["Invalid email format", "Incomplete phone formatting"]
  },
  {
    id: 4,
    customerName: "Sarah Wilson",
    email: "sarah.wilson@business.net",
    phone: "+1-555-234-5678",
    address: "321 Cedar Lane, Chicago, IL 60601",
    amount: 1750.75,
    date: "2024-01-12",
    status: "clean",
    confidence: 96
  },
  {
    id: 5,
    customerName: "mike brown",
    email: "mikebrown@email.com",
    phone: "555-345-6789",
    address: "654 Maple Dr",
    amount: 567.30,
    date: "2024-01-11",
    status: "corrected",
    confidence: 78,
    issues: ["Name capitalization", "Address incomplete"]
  }
];

const DataViewer: React.FC = () => {
  const [data, setData] = useState<DataRecord[]>(mockData);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [confidenceFilter, setConfidenceFilter] = useState<string>('all');
  const { toast } = useToast();

  const filteredData = useMemo(() => {
    return data.filter(record => {
      const matchesSearch = searchTerm === '' || 
        Object.values(record).some(value => 
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
      
      const matchesConfidence = confidenceFilter === 'all' || 
        (confidenceFilter === 'high' && record.confidence >= 90) ||
        (confidenceFilter === 'medium' && record.confidence >= 70 && record.confidence < 90) ||
        (confidenceFilter === 'low' && record.confidence < 70);

      return matchesSearch && matchesStatus && matchesConfidence;
    });
  }, [data, searchTerm, statusFilter, confidenceFilter]);

  const stats = useMemo(() => {
    const total = data.length;
    const clean = data.filter(r => r.status === 'clean').length;
    const flagged = data.filter(r => r.status === 'flagged').length;
    const corrected = data.filter(r => r.status === 'corrected').length;
    const avgConfidence = data.reduce((sum, r) => sum + r.confidence, 0) / total;

    return { total, clean, flagged, corrected, avgConfidence };
  }, [data]);

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Customer Name', 'Email', 'Phone', 'Address', 'Amount', 'Date', 'Status', 'Confidence'],
      ...filteredData.map(record => [
        record.id,
        record.customerName,
        record.email,
        record.phone,
        record.address,
        record.amount,
        record.date,
        record.status,
        record.confidence
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cleaned_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Data exported",
      description: "Your cleaned data has been exported as CSV.",
    });
  };

  const handleApprove = (id: number) => {
    setData(prev => prev.map(record => 
      record.id === id 
        ? { ...record, status: 'clean' as const, confidence: Math.min(record.confidence + 5, 100) }
        : record
    ));
    toast({
      title: "Record approved",
      description: "The data correction has been approved.",
    });
  };

  const handleReject = (id: number) => {
    setData(prev => prev.map(record => 
      record.id === id 
        ? { ...record, status: 'flagged' as const }
        : record
    ));
    toast({
      title: "Record flagged",
      description: "The record has been flagged for manual review.",
    });
  };

  const getStatusBadge = (status: string, confidence: number) => {
    if (status === 'clean') {
      return <Badge variant="default">Clean</Badge>;
    } else if (status === 'corrected') {
      return <Badge variant="secondary">Corrected</Badge>;
    } else {
      return <Badge variant="destructive">Flagged</Badge>;
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) {
      return <Badge variant="default" className="bg-green-500">High ({confidence}%)</Badge>;
    } else if (confidence >= 70) {
      return <Badge variant="secondary">Medium ({confidence}%)</Badge>;
    } else {
      return <Badge variant="destructive">Low ({confidence}%)</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Clean</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.clean}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Corrected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.corrected}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Flagged</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.flagged}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgConfidence.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Cleaned Data</CardTitle>
              <CardDescription>Review and approve AI-cleaned financial data</CardDescription>
            </div>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex space-x-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="clean">Clean</SelectItem>
                <SelectItem value="corrected">Corrected</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>
            <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Confidence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Confidence</SelectItem>
                <SelectItem value="high">High (90%+)</SelectItem>
                <SelectItem value="medium">Medium (70-89%)</SelectItem>
                <SelectItem value="low">Low (&lt;70%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{record.customerName}</div>
                        {record.issues?.includes('Name formatting') && (
                          <div className="text-xs text-orange-600 flex items-center mt-1">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Name formatting
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">{record.email}</div>
                        <div className="text-sm text-gray-500">{record.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-48">
                        <div className="text-sm truncate">{record.address}</div>
                        {record.issues?.includes('Address standardization') && (
                          <div className="text-xs text-orange-600 flex items-center mt-1">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Address standardized
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>${record.amount.toFixed(2)}</TableCell>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{getStatusBadge(record.status, record.confidence)}</TableCell>
                    <TableCell>{getConfidenceBadge(record.confidence)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        {record.status === 'corrected' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(record.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(record.id)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {record.status === 'flagged' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApprove(record.id)}
                          >
                            Fix
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataViewer;