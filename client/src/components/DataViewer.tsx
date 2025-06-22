import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Download, Eye, Edit, Trash2, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { dataStore, ProcessedFile } from '@/lib/dataStore';

interface DataRecord {
  id: number;
  [key: string]: any;
  status: 'clean' | 'flagged' | 'corrected';
  confidence: number;
  issues?: string[];
}

const DataViewer: React.FC = () => {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ProcessedFile | null>(null);
  const [data, setData] = useState<DataRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [confidenceFilter, setConfidenceFilter] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<DataRecord | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const allFiles = dataStore.getAllFiles().filter(f => f.status === 'completed');
    setFiles(allFiles);
    if (allFiles.length > 0 && !selectedFile) {
      setSelectedFile(allFiles[0]);
    }
  }, []);

  useEffect(() => {
    if (selectedFile && selectedFile.cleanedData && selectedFile.headers && selectedFile.cleaningResults) {
      const records: DataRecord[] = selectedFile.cleanedData.map((row, index) => {
        const record: DataRecord = {
          id: index + 1,
          status: 'clean',
          confidence: 100,
          issues: []
        };

        // Map data to headers
        selectedFile.headers!.forEach((header, colIndex) => {
          record[header] = row[colIndex] || '';
        });

        // Calculate status and confidence from cleaning results
        const rowResults = selectedFile.cleaningResults![index];
        if (rowResults) {
          const allIssues = rowResults.flatMap(r => r.issues);
          const avgConfidence = rowResults.reduce((sum, r) => sum + r.confidence, 0) / rowResults.length;
          
          record.issues = allIssues;
          record.confidence = Math.round(avgConfidence);
          
          if (allIssues.length > 0) {
            record.status = avgConfidence > 80 ? 'corrected' : 'flagged';
          }
        }

        return record;
      });

      setData(records);
    }
  }, [selectedFile]);

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
    const avgConfidence = total > 0 ? data.reduce((sum, r) => sum + r.confidence, 0) / total : 0;

    return { total, clean, flagged, corrected, avgConfidence };
  }, [data]);

  const handleExport = () => {
    if (!selectedFile) return;

    const csvContent = [
      selectedFile.headers,
      ...filteredData.map(record => 
        selectedFile.headers!.map(header => record[header])
      )
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cleaned_${selectedFile.name}`;
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
    
    // Add feedback to data store
    const record = data.find(r => r.id === id);
    if (record && selectedFile) {
      dataStore.addFeedback({
        userId: dataStore.getCurrentSession()?.id || 'anonymous',
        fileId: selectedFile.id,
        fieldName: 'record',
        originalValue: JSON.stringify(record),
        cleanedValue: JSON.stringify(record),
        rating: 'correct',
        confidence: record.confidence
      });
    }

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
    
    // Add feedback to data store
    const record = data.find(r => r.id === id);
    if (record && selectedFile) {
      dataStore.addFeedback({
        userId: dataStore.getCurrentSession()?.id || 'anonymous',
        fileId: selectedFile.id,
        fieldName: 'record',
        originalValue: JSON.stringify(record),
        cleanedValue: JSON.stringify(record),
        rating: 'incorrect',
        confidence: record.confidence
      });
    }

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
      return <Badge variant="destructive">Low (&lt;{confidence}%)</Badge>;
    }
  };

  if (files.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Data Available</CardTitle>
          <CardDescription>
            Upload and process files to view cleaned data here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Go to the Upload Files tab to get started with data cleaning.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* File Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select File to View</CardTitle>
          <CardDescription>Choose a processed file to review its cleaned data</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedFile?.id || ''} onValueChange={(value) => {
            const file = files.find(f => f.id === value);
            setSelectedFile(file || null);
          }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a file" />
            </SelectTrigger>
            <SelectContent>
              {files.map((file) => (
                <SelectItem key={file.id} value={file.id}>
                  {file.name} - {file.stats?.totalRecords} records
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedFile && (
        <>
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
                  <CardTitle>Cleaned Data: {selectedFile.name}</CardTitle>
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
                      <TableHead>ID</TableHead>
                      {selectedFile.headers?.slice(0, 4).map((header) => (
                        <TableHead key={header}>{header}</TableHead>
                      ))}
                      <TableHead>Status</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.slice(0, 50).map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.id}</TableCell>
                        {selectedFile.headers?.slice(0, 4).map((header) => (
                          <TableCell key={header}>
                            <div className="max-w-32 truncate">
                              {record[header]}
                              {record.issues?.some(issue => issue.toLowerCase().includes(header.toLowerCase())) && (
                                <AlertTriangle className="h-3 w-3 text-orange-500 inline ml-1" />
                              )}
                            </div>
                          </TableCell>
                        ))}
                        <TableCell>{getStatusBadge(record.status, record.confidence)}</TableCell>
                        <TableCell>{getConfidenceBadge(record.confidence)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedRecord(record)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Record Details</DialogTitle>
                                  <DialogDescription>
                                    View complete record information and cleaning details
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedRecord && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      {selectedFile.headers?.map((header) => (
                                        <div key={header}>
                                          <label className="text-sm font-medium">{header}</label>
                                          <p className="text-sm bg-gray-50 p-2 rounded">
                                            {selectedRecord[header]}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                    {selectedRecord.issues && selectedRecord.issues.length > 0 && (
                                      <div>
                                        <label className="text-sm font-medium">Issues Found</label>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {selectedRecord.issues.map((issue, index) => (
                                            <Badge key={index} variant="outline" className="text-xs">
                                              {issue}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            {record.status === 'corrected' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApprove(record.id)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReject(record.id)}
                                >
                                  <X className="h-4 w-4" />
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
              
              {filteredData.length > 50 && (
                <p className="text-sm text-muted-foreground mt-4">
                  Showing first 50 of {filteredData.length} records. Use filters to narrow down results.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default DataViewer;