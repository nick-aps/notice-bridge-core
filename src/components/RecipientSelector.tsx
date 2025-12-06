import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Users, X, Filter, Plus, ChevronDown } from "lucide-react";

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  location: string;
  status: "active" | "inactive" | "on-leave";
}

// Mock employee data
const mockEmployees: Employee[] = [
  { id: "1", name: "Alice Johnson", email: "alice@company.com", department: "IT", role: "Developer", location: "New York", status: "active" },
  { id: "2", name: "Bob Smith", email: "bob@company.com", department: "IT", role: "Manager", location: "New York", status: "active" },
  { id: "3", name: "Carol Williams", email: "carol@company.com", department: "HR", role: "Recruiter", location: "Los Angeles", status: "active" },
  { id: "4", name: "David Brown", email: "david@company.com", department: "HR", role: "Manager", location: "Chicago", status: "on-leave" },
  { id: "5", name: "Eva Martinez", email: "eva@company.com", department: "Sales", role: "Representative", location: "Miami", status: "active" },
  { id: "6", name: "Frank Garcia", email: "frank@company.com", department: "Sales", role: "Manager", location: "Houston", status: "active" },
  { id: "7", name: "Grace Lee", email: "grace@company.com", department: "Operations", role: "Analyst", location: "Seattle", status: "active" },
  { id: "8", name: "Henry Wilson", email: "henry@company.com", department: "Operations", role: "Manager", location: "Boston", status: "inactive" },
  { id: "9", name: "Ivy Chen", email: "ivy@company.com", department: "IT", role: "Developer", location: "San Francisco", status: "active" },
  { id: "10", name: "Jack Taylor", email: "jack@company.com", department: "IT", role: "DevOps", location: "Denver", status: "active" },
  { id: "11", name: "Karen Davis", email: "karen@company.com", department: "HR", role: "Specialist", location: "Phoenix", status: "active" },
  { id: "12", name: "Leo Anderson", email: "leo@company.com", department: "Sales", role: "Representative", location: "Atlanta", status: "on-leave" },
  { id: "13", name: "Mia Thomas", email: "mia@company.com", department: "Operations", role: "Coordinator", location: "Dallas", status: "active" },
  { id: "14", name: "Noah Jackson", email: "noah@company.com", department: "IT", role: "Architect", location: "Austin", status: "active" },
  { id: "15", name: "Olivia White", email: "olivia@company.com", department: "HR", role: "Director", location: "New York", status: "active" },
];

const departments = ["All", "IT", "HR", "Sales", "Operations"];
const roles = ["All", "Developer", "Manager", "Recruiter", "Representative", "Analyst", "DevOps", "Specialist", "Coordinator", "Architect", "Director"];
const locations = ["All", "New York", "Los Angeles", "Chicago", "Miami", "Houston", "Seattle", "Boston", "San Francisco", "Denver", "Phoenix", "Atlanta", "Dallas", "Austin"];
const statuses = ["All", "active", "inactive", "on-leave"];

interface RecipientSelectorProps {
  selectedRecipients: Employee[];
  onRecipientsChange: (recipients: Employee[]) => void;
}

export const RecipientSelector = ({
  selectedRecipients,
  onRecipientsChange,
}: RecipientSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredEmployees = useMemo(() => {
    return mockEmployees.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase());
      const matchesDepartment = departmentFilter === "All" || emp.department === departmentFilter;
      const matchesRole = roleFilter === "All" || emp.role === roleFilter;
      const matchesLocation = locationFilter === "All" || emp.location === locationFilter;
      const matchesStatus = statusFilter === "All" || emp.status === statusFilter;

      return matchesSearch && matchesDepartment && matchesRole && matchesLocation && matchesStatus;
    });
  }, [search, departmentFilter, roleFilter, locationFilter, statusFilter]);

  const isSelected = (employee: Employee) =>
    selectedRecipients.some((r) => r.id === employee.id);

  const toggleEmployee = (employee: Employee) => {
    if (isSelected(employee)) {
      onRecipientsChange(selectedRecipients.filter((r) => r.id !== employee.id));
    } else {
      onRecipientsChange([...selectedRecipients, employee]);
    }
  };

  const addAllFiltered = () => {
    const newRecipients = [...selectedRecipients];
    filteredEmployees.forEach((emp) => {
      if (!newRecipients.some((r) => r.id === emp.id)) {
        newRecipients.push(emp);
      }
    });
    onRecipientsChange(newRecipients);
  };

  const removeRecipient = (employeeId: string) => {
    onRecipientsChange(selectedRecipients.filter((r) => r.id !== employeeId));
  };

  const clearFilters = () => {
    setSearch("");
    setDepartmentFilter("All");
    setRoleFilter("All");
    setLocationFilter("All");
    setStatusFilter("All");
  };

  const hasActiveFilters =
    search !== "" ||
    departmentFilter !== "All" ||
    roleFilter !== "All" ||
    locationFilter !== "All" ||
    statusFilter !== "All";

  return (
    <div className="space-y-3">
      <Label>Recipients *</Label>

      {/* Selected Recipients Display */}
      {selectedRecipients.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 rounded-lg border border-border bg-muted/30">
          {selectedRecipients.map((recipient) => (
            <Badge
              key={recipient.id}
              variant="secondary"
              className="flex items-center gap-1 py-1"
            >
              {recipient.name}
              <button
                type="button"
                onClick={() => removeRecipient(recipient.id)}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Recipient Selector Dropdown */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {selectedRecipients.length > 0
                ? `${selectedRecipients.length} recipient(s) selected`
                : "Select recipients..."}
            </span>
            <ChevronDown className="w-4 h-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0 bg-popover" align="start">
          <div className="p-3 border-b border-border space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 gap-2">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept === "All" ? "All Departments" : dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role === "All" ? "All Roles" : role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc === "All" ? "All Locations" : loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === "All" ? "All Statuses" : status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {filteredEmployees.length} employee(s) found
              </span>
              <div className="flex gap-2">
                {hasActiveFilters && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-7 text-xs"
                  >
                    <Filter className="w-3 h-3 mr-1" />
                    Clear
                  </Button>
                )}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={addAllFiltered}
                  className="h-7 text-xs"
                  disabled={filteredEmployees.length === 0}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add All ({filteredEmployees.length})
                </Button>
              </div>
            </div>
          </div>

          {/* Employee List */}
          <ScrollArea className="h-[250px]">
            {filteredEmployees.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No employees match your filters
              </div>
            ) : (
              <div className="p-2">
                {filteredEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleEmployee(employee)}
                  >
                    <Checkbox checked={isSelected(employee)} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {employee.name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {employee.role} • {employee.department} • {employee.location}
                      </div>
                    </div>
                    <Badge
                      variant={
                        employee.status === "active"
                          ? "default"
                          : employee.status === "on-leave"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-xs shrink-0"
                    >
                      {employee.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
};
