import * as vscode from 'vscode';
import configuration from './configuration';

export function activate(context: vscode.ExtensionContext): void {
    configuration.update(context);

    context.subscriptions.push(
        vscode.commands.registerCommand('apngPlayer.openPlayer', () => {
            import('./apngPlayer').then(({ ApngPlayer }) => {
                ApngPlayer.createOrShow(context.extensionUri);
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
