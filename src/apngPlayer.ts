import vscode from 'vscode';
import path from 'path';

import { __DEV__ } from './constants';
import { getNonce } from './utils';

export class ApngPlayer {
    public static readonly viewType = 'ApngPlayer';
    public static currentPlayer: ApngPlayer | undefined;

    private readonly extensionUri: vscode.Uri;
    private readonly disposables: vscode.Disposable[] = [];
    private panel: vscode.WebviewPanel | undefined;
    private html = '';
    private apngUri: vscode.Uri;

    public static createOrShow(extensionUri: vscode.Uri, apngUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (ApngPlayer.currentPlayer) {
            ApngPlayer.currentPlayer.panel!.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            ApngPlayer.viewType,
            'APNG Player',
            column ?? vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [
                    extensionUri,
                    apngUri.with({ path: path.dirname(apngUri.path) }),
                ],
                retainContextWhenHidden: true,
            },
        );

        ApngPlayer.currentPlayer = new ApngPlayer(panel, extensionUri, apngUri);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, apngUri: vscode.Uri) {
        this.panel = panel;
        this.extensionUri = extensionUri;
        this.apngUri = apngUri;

        // setup listeners
        this.panel.onDidDispose(() => this.dispose(), this, this.disposables);
        this.panel.webview.onDidReceiveMessage(this.handleWebViewMessage, this, this.disposables);

        // Set the webview's initial html content
        this.setupHtmlForWebview(this.panel.webview);
    }

    private async handleWebViewMessage(message: any) {
        switch (message.command) {
            case 'webpack.reload':
                vscode.commands.executeCommand('workbench.action.webview.reloadWebviewAction');
                return;
        }
    }

    private setupHtmlForWebview(webview: vscode.Webview) {
        const scriptSrc = __DEV__
            ? 'http://localhost:3000/webview.js'
            : webview.asWebviewUri(
                  vscode.Uri.joinPath(this.extensionUri, 'dist', 'web', 'webview.js'),
              );
        const nonce = getNonce();
        const nonceAttr = __DEV__ ? '' : `nonce="${nonce}"`;
        const configuration = {};
        const cspMeta = __DEV__
            ? ''
            : `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">`;

        this.html = `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        ${cspMeta}
        <meta id='data'
					data-uri='${this.panel!.webview.asWebviewUri(this.apngUri).toString()}'
					data-configuration='${JSON.stringify(configuration)}'>
        <title>APNG Player</title>
    </head>
    <body>
        <div id="root"></div>
        <script ${nonceAttr} src="${scriptSrc}"></script>
    </body>
</html>`;
        if (this.panel?.webview) {
            this.panel.webview.html = this.html;
        }
    }

    private dispose() {
        ApngPlayer.currentPlayer = undefined;
        this.panel = undefined;

        while (this.disposables.length > 0) {
            const x = this.disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
}
