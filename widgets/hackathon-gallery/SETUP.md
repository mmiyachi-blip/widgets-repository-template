# Hackathon Gallery セットアップ

保存先は CC 標準の「記事」。投稿は下書きで作成され、運営が公開すると一覧に出る(=承認フロー)。

## 1. コミュニティ側の準備(管理者)

1. 保存先カテゴリは **AI分科会(ID 427)をそのまま使う**(公開カテゴリで記事の投稿も可能。新規作成は不要)。
   - 一覧は記事のタグ `hackathon` で絞り込むため、通常のAI分科会の記事とは混ざらない。
   - 公開したハッカソン記事は、AI分科会ページの「新着投稿」にも自然に流れる。
   - 将来カテゴリを分けたくなったら、Variable と手順4の `categoryId` を差し替えるだけでよい。
2. Developer Studio > **Variables** に追加:
   - `hk_category_id` … `427`
   - `hk_moderator_id` … モデレーター権限を持つユーザーID(投稿の代理作成に使用)
3. **Secrets** `cc_api_client_id` / `cc_api_client_secret` は既存のものを流用(他ウィジェットと同じ)。
   - 投稿・いいねには **write 系スコープ**が必要。Control > Integrations > API でスコープを確認し、
     `connectors.json` の `"scope": "read write"` を実際のスコープ名に合わせる。
4. `connectors.json` の `hk-article-create` の `"categoryId": 427` を、手順1のカテゴリIDに変更
   (リクエスト本文テンプレートでは Variable が使えないため直書き)。

## 2. 公開

```bash
./bin/build-registry.sh
```
`extensions_registry.json` / `connectors_registry.json` ごとコミットして `main` に push(自動公開)。
Developer Studio の **Test Connection** で `hk-articles-list` から先に確認すること。

## 3. ページに配置

No-Code Builder で AI分科会ページに「Hackathon Gallery」を追加。
動作確認だけしたいときは、設定の「データの保存先」を「モックデータ」にする。

## 4. 運用

- 投稿された記事は下書き → 管理画面で内容(機密情報・不正な指示がないか)を確認して公開。
- 記事のタグ規約: `hackathon`(対象の目印)/ `hk-skill`・`hk-prompt` / `hk-tool-*` / その他はトピックタグ。
  管理画面で記事を編集する場合もこれらのタグは消さない。
- いいねは CC 標準のいいね。コメントは記事ページ(カードの詳細から遷移)で行う。

## 実機で要確認

- Jinja テンプレート(一覧の整形・投稿本文の組み立て)はローカルで JSON 生成まで検証済みだが、
  CC 本番での動作は Test Connection で確認する。
- `user.id` を使うコネクタは未ログインだと拒否される(UIは「ログインしてください」を表示)。
- 一覧は最新100件まで(ページング未対応)。
- ダウンロード数は CC 標準に保存場所がないため、コミュニティ版では表示しない。
- 本文サイズの上限、タグに使える文字は未確認(投稿側で `, & # / \ < >` は除去している)。
