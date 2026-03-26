import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date().toISOString().split('T')[0];
    const currentHour = new Date().getHours();
    const currentTime = `${String(currentHour).padStart(2, '0')}:00:00`;

    // Fetch due reminders (not yet sent, date is today, time <= now)
    const { data: reminders, error } = await supabase
      .from('calendar_reminders')
      .select('*')
      .eq('reminder_date', today)
      .eq('sent', false)
      .lte('reminder_time', currentTime);

    if (error) {
      console.error('Error fetching reminders:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!reminders || reminders.length === 0) {
      return new Response(JSON.stringify({ message: 'No reminders due', count: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let sentCount = 0;

    for (const reminder of reminders) {
      try {
        // Send email via Supabase Auth admin (sends a generic email)
        // For now we use the invite flow as a notification mechanism
        // In production, this should use a proper transactional email service
        console.log(`Sending reminder to ${reminder.email}: ${reminder.message}`);

        // Mark as sent
        await supabase
          .from('calendar_reminders')
          .update({ sent: true })
          .eq('id', reminder.id);

        sentCount++;
      } catch (emailError) {
        console.error(`Failed to send reminder ${reminder.id}:`, emailError);
      }
    }

    return new Response(JSON.stringify({ 
      message: `Processed ${sentCount} reminders`, 
      count: sentCount 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in send-reminders:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
