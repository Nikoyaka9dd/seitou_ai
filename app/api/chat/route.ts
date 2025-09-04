import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// .env.localファイルから環境変数を読み込む
const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const azureKey = process.env.AZURE_OPENAI_KEY;
const apiVersion = process.env.AZURE_OPENAI_API_VERSION;

// 各政党名と、Azure OpenAI Studioで作成したAgent(Assistant)のIDを対応させる
const partyAgentMap: { [key: string]: string } = {
  "自民党": "asst_xxxxxxxxxxxxxxxxxxxx",
  "民主党": "asst_yyyyyyyyyyyyyyyyyyyy",
  "維新": "asst_zzzzzzzzzzzzzzzzzzzz",
  "公明党": "asst_aaaaaaaaaaaaaaaaaaaa",
  "国民民主": "asst_bbbbbbbbbbbbbbbbbbbb",
  "共産党": "asst_cccccccccccccccccccc",
  "れいわ": "asst_dddddddddddddddddddd",
  "社民党": "asst_eeeeeeeeeeeeeeeeeeee",
  "参政党": "asst_ffffffffffffffffffff",
  "みんな": "asst_gggggggggggggggggggg",
  "みらい": "asst_hhhhhhhhhhhhhhhhhhhh"
};

export async function POST(request: Request) {
  if (!endpoint || !azureKey || !apiVersion) {
    console.error("Azure OpenAIの認証情報が.env.localに設定されていません。");
    return NextResponse.json({ error: 'サーバーの構成エラーです' }, { status: 500 });
  }

  try {
    const { question, partyName } = await request.json();
    if (!question || !partyName) {
      return NextResponse.json({ error: '質問と政党名が必要です' }, { status: 400 });
    }

    const assistantId = partyAgentMap[partyName];
    if (!assistantId) {
      return NextResponse.json({ error: '対応する政党のエージェントが見つかりません' }, { status: 404 });
    }
    
    const client = new OpenAI({
      apiKey: azureKey,
      baseURL: endpoint, // エンドポイントを指定
      defaultQuery: { 'api-version': apiVersion }, // APIバージョンを指定
      defaultHeaders: { 'api-key': azureKey },
    });


    const thread = await client.beta.threads.create();
    

    await client.beta.threads.messages.create(thread.id, {
        role: "user",
        content: question
    });


    let run = await client.beta.threads.runs.create(thread.id, { assistant_id: assistantId });


    do {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      run = await client.beta.threads.runs.retrieve(run.id, { thread_id: thread.id });
    } while (run.status === "queued" || run.status === "in_progress")

    if (run.status === "failed") {
      console.error("Run failed:", run.last_error);
      throw new Error(`AIエージェントの実行に失敗しました: ${run.last_error?.message}`);
    }


    const messages = await client.beta.threads.messages.list(thread.id);


    const lastAssistantMessage = messages.data.filter(m => m.role === 'assistant').pop();
    const aiAnswer = lastAssistantMessage?.content[0]?.type === 'text' 
      ? lastAssistantMessage.content[0].text.value 
      : "すみません、回答を生成できませんでした。";

    return NextResponse.json({ answer: aiAnswer });

  } catch (error) {
    console.error("APIルートでエラーが発生しました:", error);
    const errorMessage = error instanceof Error ? error.message : "不明なエラー";
    return NextResponse.json({ error: `サーバーでエラーが発生しました: ${errorMessage}` }, { status: 500 });
  }
}
