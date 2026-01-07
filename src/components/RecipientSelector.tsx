import { useState, useMemo, useEffect } from "react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Users, X, Filter, Plus, ChevronDown, Loader2 } from "lucide-react";

export interface Employee {
  id: string;
  name: string;
  email: string;
  department?: string;
  role?: string;
  location?: string;
  status?: "active" | "inactive" | "on-leave";
  mobile?: string;
}

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

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Keep it simple: Role + optional Status
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const statuses = ["All", "active", "inactive", "on-leave"];

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/notifications/get_employees", {
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          console.error("Failed to fetch employees:", response.status);
          setEmployees([]);
          return;
        }

        const data = (await response.json()) as Employee[];
        setEmployees(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error loading employees:", error);
        setEmployees([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Build role dropdown dynamically from whatever Greentree returns
  const roles = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => {
      const r = (e.role || "").trim();
      if (r) set.add(r);
    });
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();

    return employees.filter((emp) => {
      const name = (emp.name || "").toLowerCase();
      const email = (emp.email || "").toLowerCase();

      const matchesSearch = !q || name.includes(q) || email.includes(q);

      const empRole = (emp.role || "").trim();
      const matchesRole = roleFilter === "All" || empRole === roleFilter;

      const empStatus = (emp.status || "active").trim();
      const matchesStatus = statusFilter === "All" || empStatus === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [employees, search, roleFilter, statusFilter]);

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
    setRoleFilter("All");
    setStatusFilter("All");
  };

  const hasActiveFilters =
    search.trim() !== "" || roleFilter !== "All" || statusFilter !== "All";

  return (
    <div className="space-y-3">
      <Label>Recipients *</Label>

      {/* Selected recipients */}
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
                aria-label={`Remove ${recipient.name}`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Dropdown */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="w-full justify-between">
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {selectedRecipients.length > 0
                ? `${selectedRecipients.length} recipient(s) selected`
                : "Select recipients..."}
            </span>
            <ChevronDown className="w-4 h-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[420px] p-0 bg-popover" align="start">
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

            {/* Filters: Role + (optional) Status */}
            <div className="grid grid-cols-2 gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent className="bg-popover max-h-[220px] overflow-auto">
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role === "All" ? "All Roles" : role}
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
                      {status === "All"
                        ? "All Statuses"
                        : status.charAt(0).toUpperCase() +
                          status.slice(1).replace("-", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
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

          {/* List */}
          <ScrollArea className="h-[260px]">
            {isLoading ? (
              <div className="p-8 flex justify-center text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Loading staff...
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No employees match your filters
              </div>
            ) : (
              <div className="p-2">
                {filteredEmployees.map((employee) => {
                  const status = employee.status || "active";
                  const subtitleParts = [
                    employee.role || "",
                    employee.department || "",
                    employee.location || "",
                  ].filter(Boolean);

                  return (
                    <div
                      key={employee.id}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                      onClick={() => toggleEmployee(employee)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") toggleEmployee(employee);
                      }}
                    >
                      <Checkbox checked={isSelected(employee)} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{employee.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {subtitleParts.join(" • ")}
                        </div>
                      </div>

                      <Badge
                        variant={
                          status === "active"
                            ? "default"
                            : status === "on-leave"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-xs shrink-0"
                      >
                        {status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
};
