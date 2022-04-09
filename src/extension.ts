import * as vscode from 'vscode';
import configuration from './configuration';

export function activate(context: vscode.ExtensionContext): void {
    configuration.update(context);

    context.subscriptions.push(
        vscode.commands.registerCommand('apngPlayer.openPlayer', (apngUri: vscode.Uri) => {
            import('./apngPlayer').then(({ ApngPlayer }) => {
                ApngPlayer.createOrShow(context.extensionUri, apngUri);
            });
        }),
        vscode.workspace.onDidChangeConfiguration(() => {
            configuration.update(context);
        }),
    );
}

export function deactivate(): void {
    // recycle resource...
}
