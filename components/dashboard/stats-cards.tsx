'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Send, Trophy, Clock } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalLeads: number;
    quotationsSent: number;
    dealsWon: number;
    pendingFollowups: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Leads',
      value: stats.totalLeads,
      change: '+12%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Quotations Sent',
      value: stats.quotationsSent,
      change: '+8%',
      changeType: 'positive' as const,
      icon: Send,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Deals Won',
      value: stats.dealsWon,
      change: '+24%',
      changeType: 'positive' as const,
      icon: Trophy,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Pending Followups',
      value: stats.pendingFollowups,
      change: '-5%',
      changeType: 'negative' as const,
      icon: Clock,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#333333]">
              {card.value.toLocaleString()}
            </div>
            <p className={`text-xs mt-1 ${
              card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              {card.change} from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}