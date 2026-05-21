import { getRules } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, AlertTriangle, Star, ArrowRight } from "lucide-react";

export default function RulesPage() {
  const rules = getRules();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">机制规则</h1>
        <p className="text-sm text-gray-500 mt-1">
          Skill生态的准入、评分、淘汰和激励机制
        </p>
      </div>

      {/* Admission */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            准入机制
          </CardTitle>
          <p className="text-sm text-gray-500">{rules.admission.description}</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 flex-wrap">
            {rules.admission.steps.map((step, idx) => (
              <div key={step.step} className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                  <span className="text-xs font-bold text-blue-600">
                    {step.step}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {idx < rules.admission.steps.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-gray-300" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scoring */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            评分机制
          </CardTitle>
          <p className="text-sm text-gray-500">{rules.scoring.description}</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>评分维度</TableHead>
                <TableHead className="w-20">权重</TableHead>
                <TableHead>说明</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.scoring.dimensions.map((dim) => (
                <TableRow key={dim.dimension}>
                  <TableCell className="font-medium">{dim.dimension}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {(dim.weight * 100).toFixed(0)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {dim.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Elimination */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            淘汰机制
          </CardTitle>
          <p className="text-sm text-gray-500">
            {rules.elimination.description}
          </p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {rules.elimination.conditions.map((condition, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                {condition}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Incentive */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            🎯 激励机制
          </CardTitle>
          <p className="text-sm text-gray-500">
            {rules.incentive.description}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {rules.incentive.rules.map((rule, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700"
              >
                <span className="text-green-500 font-mono text-xs">+</span>
                {rule}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
