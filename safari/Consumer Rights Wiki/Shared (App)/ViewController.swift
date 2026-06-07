//
//  ViewController.swift
//  Shared (App)
//
//  Created by host on 6/2/26.
//

import SwiftUI
import Combine

#if os(iOS)
import UIKit
typealias PlatformViewController = UIViewController
#elseif os(macOS)
import Cocoa
import SafariServices
typealias PlatformViewController = NSViewController
#endif

let extensionBundleIdentifier = "com.aaroncooke.crw-safari-extension.Extension"

private enum OnboardingColors {
    static let brand = Color(red: 0.0, green: 64.0 / 255.0, blue: 128.0 / 255.0)
    static let background = Color(red: 0.95, green: 0.98, blue: 1.0)
    static let panel = Color.white
    static let text = Color(red: 0.08, green: 0.12, blue: 0.18)
    static let muted = Color(red: 0.36, green: 0.42, blue: 0.50)
    static let border = Color(red: 0.82, green: 0.88, blue: 0.95)
    static let link = Color(red: 0.12, green: 0.45, blue: 0.90)

#if os(iOS)
    static let platformBackground = UIColor(red: 0.95, green: 0.98, blue: 1.0, alpha: 1.0)
#elseif os(macOS)
    static let platformBackground = NSColor(red: 0.95, green: 0.98, blue: 1.0, alpha: 1.0)
#endif
}

private enum OnboardingPlatform {
    case ios
    case mac
}

private final class OnboardingModel: ObservableObject {
    let platform: OnboardingPlatform
    @Published var isExtensionEnabled: Bool?

    init(platform: OnboardingPlatform) {
        self.platform = platform
    }
}

private struct OnboardingView: View {
    @ObservedObject var model: OnboardingModel
    let openSafariSettings: (() -> Void)?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                header
                status
                steps
                links
            }
            .frame(maxWidth: 560, alignment: .leading)
            .padding(28)
            .frame(maxWidth: .infinity, alignment: .top)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
        .background(OnboardingColors.background.ignoresSafeArea())
        .preferredColorScheme(.light)
    }

    private var header: some View {
        HStack(alignment: .center, spacing: 16) {
            Image("LargeIcon")
                .resizable()
                .frame(width: 72, height: 72)
                .clipShape(RoundedRectangle(cornerRadius: 12))

            VStack(alignment: .leading, spacing: 6) {
                Text("Consumer Rights Wiki")
                    .font(.title.bold())
                    .foregroundStyle(OnboardingColors.brand)
                Text("Safari extension")
                    .font(.headline)
                    .foregroundStyle(OnboardingColors.muted)
            }
        }
    }

    private var status: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: "gearshape")
                .font(.title3)
                .foregroundStyle(OnboardingColors.brand)
                .frame(width: 28)

            VStack(alignment: .leading, spacing: 8) {
                Text("Open settings")
                    .font(.headline)
                    .foregroundStyle(OnboardingColors.text)
                Text(statusText)
                    .font(.body)
                    .foregroundStyle(OnboardingColors.muted)
                    .fixedSize(horizontal: false, vertical: true)

                if let openSafariSettings = openSafariSettings {
                    Button("Open Safari Settings", action: openSafariSettings)
                        .buttonStyle(.borderedProminent)
                        .tint(OnboardingColors.brand)
                }
            }
        }
        .onboardingCard()
    }

    private var statusText: String {
        switch model.platform {
        case .ios:
            return "Open Settings, choose Safari > Extensions, then turn on Consumer Rights Wiki."
        case .mac:
            if model.isExtensionEnabled == true {
                return "The extension is currently on. You can manage it in Safari Settings > Extensions."
            }
            if model.isExtensionEnabled == false {
                return "The extension is currently off. Turn it on in Safari Settings > Extensions."
            }
            return "You can turn on the extension in Safari Settings > Extensions."
        }
    }

    private var steps: some View {
        VStack(alignment: .leading, spacing: 14) {
            OnboardingStep(
                symbol: "safari",
                title: "Enable the extension",
                detail: model.platform == .ios
                    ? "On iPhone and iPad, enable it from Settings > Safari > Extensions."
                    : "On macOS, enable it from Safari Settings > Extensions."
            )
            OnboardingStep(
                symbol: "globe",
                title: "Grant All Websites access",
                detail: "CRW needs broad website access so it can compare the page you are viewing against Consumer Rights Wiki match data."
            )
            OnboardingStep(
                symbol: "lock.shield",
                title: "Privacy",
                detail: "The extension checks page URL, title, and metadata locally against a dataset downloaded from GitHub. Host access is not used for tracking or advertising."
            )
        }
    }

    private var links: some View {
        HStack(spacing: 16) {
            Link("Consumer Rights Wiki", destination: URL(string: "https://consumerrights.wiki")!)
            Link("Privacy", destination: URL(string: "https://github.com/6K6666/crw-extension/blob/main/PRIVACY.md")!)
            Link("Support", destination: URL(string: "https://github.com/6K6666/crw-extension/discussions")!)
        }
        .font(.callout.weight(.semibold))
        .foregroundStyle(OnboardingColors.link)
    }
}

private struct OnboardingStep: View {
    let symbol: String
    let title: String
    let detail: String

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: symbol)
                .font(.title3)
                .foregroundStyle(OnboardingColors.brand)
                .frame(width: 28)

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.headline)
                    .foregroundStyle(OnboardingColors.text)
                Text(detail)
                    .font(.body)
                    .foregroundStyle(OnboardingColors.muted)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .onboardingCard()
    }
}

private extension View {
    func onboardingCard() -> some View {
        self
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(OnboardingColors.panel)
        .clipShape(RoundedRectangle(cornerRadius: 10))
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(OnboardingColors.border, lineWidth: 1)
        )
    }
}

class ViewController: PlatformViewController {

#if os(iOS)
    private let onboardingModel = OnboardingModel(platform: .ios)
    private var hostingController: UIHostingController<OnboardingView>?
#elseif os(macOS)
    private let onboardingModel = OnboardingModel(platform: .mac)
    private var hostingView: NSHostingView<OnboardingView>?
    private var extensionStateObserver: NSObjectProtocol?
#endif

    override func viewDidLoad() {
        super.viewDidLoad()

#if os(iOS)
        view.backgroundColor = OnboardingColors.platformBackground
#elseif os(macOS)
        view.wantsLayer = true
        view.layer?.backgroundColor = OnboardingColors.platformBackground.cgColor
#endif

        installOnboardingView()

#if os(macOS)
        extensionStateObserver = NotificationCenter.default.addObserver(
            forName: NSApplication.didBecomeActiveNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            self?.refreshExtensionState()
        }
        refreshExtensionState()
#endif
    }

    deinit {
#if os(macOS)
        if let extensionStateObserver {
            NotificationCenter.default.removeObserver(extensionStateObserver)
        }
#endif
    }

#if os(macOS)
    override func viewDidAppear() {
        super.viewDidAppear()

        if let window = view.window {
            window.minSize = NSSize(width: 640, height: 520)
            window.setContentSize(NSSize(width: 760, height: 640))
            window.center()
        }

        refreshExtensionState()
    }
#endif

    private func installOnboardingView() {
#if os(iOS)
        let controller = UIHostingController(
            rootView: OnboardingView(
                model: onboardingModel,
                openSafariSettings: nil
            )
        )
        addChild(controller)
        controller.view.backgroundColor = OnboardingColors.platformBackground
        controller.view.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(controller.view)
        NSLayoutConstraint.activate([
            controller.view.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            controller.view.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            controller.view.topAnchor.constraint(equalTo: view.topAnchor),
            controller.view.bottomAnchor.constraint(equalTo: view.bottomAnchor),
        ])
        controller.didMove(toParent: self)
        hostingController = controller
#elseif os(macOS)
        let hostingView = NSHostingView(
            rootView: OnboardingView(
                model: onboardingModel,
                openSafariSettings: { [weak self] in
                    self?.openSafariExtensionSettings()
                }
            )
        )
        hostingView.wantsLayer = true
        hostingView.layer?.backgroundColor = OnboardingColors.platformBackground.cgColor
        hostingView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(hostingView)
        NSLayoutConstraint.activate([
            hostingView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            hostingView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            hostingView.topAnchor.constraint(equalTo: view.topAnchor),
            hostingView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
        ])
        self.hostingView = hostingView
#endif
    }

#if os(macOS)
    private func refreshExtensionState() {
        SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: extensionBundleIdentifier) { [weak self] state, error in
            DispatchQueue.main.async {
                if let error {
                    NSLog("Failed to read Safari extension state: \(error.localizedDescription)")
                    self?.onboardingModel.isExtensionEnabled = nil
                    return
                }
                self?.onboardingModel.isExtensionEnabled = state?.isEnabled
            }
        }
    }

    private func openSafariExtensionSettings() {
        SFSafariApplication.showPreferencesForExtension(withIdentifier: extensionBundleIdentifier) { error in
            if let error = error {
                NSLog("Failed to open Safari extension settings: \(error.localizedDescription)")
            }
        }
    }
#endif

}
