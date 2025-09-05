import { NextResponse } from 'next/server';
// 正しいSDKをインポートします
import { AgentsClient, isOutputOfType, MessageTextContent } from "@azure/ai-agents"; 
import { DefaultAzureCredential } from "@azure/identity";

// .env.localからプロジェクトのエンドポイントを読み込みます
const endpoint = process.env.PROJECT_ENDPOINT;

// 各政党のAgent IDをここに記述します
const partyAgentMap: { [key: string]: string } = {
  "自民党": "asst_i4weP8mjguVozSjbjZTWxb0U",
  "民主党": "asst_MTYnjjtHVqqMQfAGHVtvjPvT",
  "共産党": "asst_qLnUVnitKSF1uFMJny1Vjajf",
  
  // 他の政党のIDも、準備ができ次第ここに追加してください
  // "立憲民主党": "asst_...",
};

export async function POST(request: Request) {
  if (!endpoint) {
    console.error("PROJECT_ENDPOINTが.env.localに設定されていません。");
    return NextResponse.json({ error: 'サーバーの構成エラーです' }, { status: 500 });
  }

  try {
    const { question, partyName } = await request.json();
    const agentId = partyAgentMap[partyName];

    if (!agentId) {
      // 対応するIDがない場合は、準備中である旨を返します
      return NextResponse.json({ answer: `「${partyName}」のAIは現在準備中です。もうしばらくお待ちください。` });
    }

    // DefaultAzureCredentialは、az loginの認証情報を自動で読み込みます
    const client = new AgentsClient(endpoint, new DefaultAzureCredential());

    // 以下、あなたのコードのロジックを元に、対話フローを実装します
    const thread = await client.threads.create();
    await client.messages.create(thread.id, "user", question);
    let run = await client.runs.create(thread.id, agentId);

    // 実行が完了するまでポーリング（定期確認）します
    while (run.status === "queued" || run.status === "in_progress") {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1秒待機
      run = await client.runs.get(thread.id, run.id);
    }

    if (run.status === "failed") {
      console.error(`Run failed: `, run.lastError);
      throw new Error(`AIエージェントの実行に失敗しました: ${run.lastError}`);
    }

    // メッセージリストを取得します
    const messagesIterator = client.messages.list(thread.id);
    const messagesArray = [];
    for await (const m of messagesIterator) {
        messagesArray.push(m);
    }
    
    // AIからの最後の返信を見つけます
    const assistantMessage = messagesArray.find((m) => m.role === "assistant");
    
    let aiAnswer = "すみません、回答をテキスト形式で取得できませんでした。";

    if (assistantMessage) {
        // テキストコンテンツを安全に抽出します
        const textContent = assistantMessage.content.find(
            (content): content is MessageTextContent => isOutputOfType(content, "text")
        );
        if (textContent) {
            aiAnswer = textContent.text.value;
        }
    }

    // フロントエンドに回答を返します
    return NextResponse.json({ answer: aiAnswer });

  } catch (error) {
    console.error("APIルートでエラーが発生しました:", error);
    const errorMessage = error instanceof Error ? error.message : "不明なエラー";
    return NextResponse.json({ error: `サーバーでエラーが発生しました: ${errorMessage}` }, { status: 500 });
  }
}

