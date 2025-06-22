
import { useState } from "react";
import { Search, Filter, Download, Eye, Edit, Trash2, CheckCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DataViewer = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const sampleData = [
    {
      id: 1,
      customerName: "John Smith",
      accountNumber: "ACC-001234",
      transactionAmount: 1250.50,
      transactionDate: "2024-01-15",
      category: "Investment",
      status: "cleaned",
      confidence: 98.5,
      issues: []
    },
    {
      id: 2,
      customerName: "Sarah Johnson",
      accountNumber: "ACC-001235",
      transactionAmount: 750.00,
      transactionDate: "2024-01-16",
      category: "Loan Payment",
      status: "needs_review",
      confidence: 76.2,
      issues: ["Date format inconsistency"]
    },
    {
      id: 3,
      customerName: "Michael Brown",
      accountNumber: "ACC-001236",
      transactionAmount: 2100.75,
      transactionDate: "2024-01-17",
      category: "Insurance Claim",
      status: "cleaned",
      confidence: 99.1,
      issues: []
    },
    {
      id: 4,
      customerName: "Emily Davis",
      accountNumber: "ACC-001237",
      transactionAmount: 450.25,
      transactionDate: "2024-01-18",
      category: "Deposit",
      status: "flagged",
      confidence: 45.8,
      issues: ["Potential duplicate", "Suspicious amount pattern"]
    },
    {
      id: 5,
      customerName: "David Wilson",
      accountNumber: "ACC-001238",
      transactionAmount: 890.00,
      transactionDate: "2024-01-19",
      category: "Transfer",
      status: "cleaned",
      confidence: 94.3,
      issues: []
    }
  ];

  const filteredData = sampleData.filter(item => {
    const matchesSearch = item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.accountNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === "all" || item.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string, confidence: number) => {
    switch (status) {
      case "cleaned":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Cleaned</Badge>;
      case "needs_review":
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="h-3 w-3 mr-1" />Review</Badge>;
      case "flagged":
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Flagged</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600";
    if (confidence >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cleaned Data Viewer</CardTitle>
          <CardDescription>
            Review and manage your cleaned financial data. Use filters to find specific records or issues.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by customer name or account number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Records</SelectItem>
                <SelectItem value="cleaned">Cleaned</SelectItem>
                <SelectItem value="needs_review">Needs Review</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confidence
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{record.customerName}</div>
                          {record.issues.length > 0 && (
                            <div className="text-xs text-red-600 mt-1">
                              {record.issues.length} issue{record.issues.length > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.accountNumber}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${record.transactionAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.transactionDate}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Badge variant="outline">{record.category}</Badge>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {getStatusBadge(record.status, record.confidence)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getConfidenceColor(record.confidence)}`}>
                          {record.confidence}%
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No records found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Data Quality Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">97.3%</div>
            <p className="text-sm text-muted-foreground">Above target of 95%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Records Processed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">45,231</div>
            <p className="text-sm text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Issues Flagged</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">127</div>
            <p className="text-sm text-muted-foreground">Requiring review</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataViewer;
