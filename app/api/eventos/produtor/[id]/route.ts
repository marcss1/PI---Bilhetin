import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  //  Using createRouteHandlerClient instead of createClient with env vars
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    const { data: eventos, error } = await supabase
      .from('eventos')
      .select(`
        *,
        tipos_ingresso (*)
      `)
      .eq('organizador_id', params.id)
      .order('data', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(eventos)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
