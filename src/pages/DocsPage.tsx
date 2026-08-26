import {
  useEffect,
  useState,
  type ElementType,
} from "react";

import Prism from "prismjs";

import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-json";

import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Code2,
  Copy,
  ExternalLink,
  KeyRound,
  Menu,
  Package,
  PanelLeft,
  Play,
  Search,
  Server,
  Settings,
  ShieldCheck,
  Terminal,
  X,
} from "lucide-react";

import { GithubIcon } from "../components/icons/GithubIcon";

import "./docs.css";

const VERSION = "v0.1.7.dev6";

type Section = {
  id: string;
  label: string;
  icon: ElementType;
};

const sections: Section[] = [
  {
    id: "overview",
    label: "Overview",
    icon: BookOpen,
  },
  {
    id: "installation",
    label: "Installation",
    icon: Package,
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: PanelLeft,
  },
  {
    id: "api-keys",
    label: "API Keys",
    icon: KeyRound,
  },
  {
    id: "ml-doc",
    label: "MLDoc",
    icon: Code2,
  },
  {
    id: "manual-reports",
    label: "Manual Reports",
    icon: Terminal,
  },
  {
    id: "auto-reports",
    label: "Auto Reports",
    icon: Server,
  },
  {
    id: "data-quality",
    label: "Data Quality",
    icon: Settings,
  },
  {
    id: "validation",
    label: "Validation",
    icon: ShieldCheck,
  },
  {
    id: "errors",
    label: "Errors",
    icon: X,
  },
  {
    id: "reference",
    label: "API Reference",
    icon: Code2,
  },
];

/* =========================================================
   CODE BLOCK
========================================================= */

function CodeBlock({
  language = "Python",
  code,
  comment = "",
}: {
  language?: string;
  code: string;
  comment?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error(
        "Failed to copy code:",
        error
      );
    }
  };

  const getLanguage = () => {
    const value =
      language.toLowerCase();

    if (value === "python") {
      return "python";
    }

    if (
      value === "shell" ||
      value === "bash"
    ) {
      return "bash";
    }

    if (value === "javascript") {
      return "javascript";
    }

    if (value === "typescript") {
      return "typescript";
    }

    if (value === "json") {
      return "json";
    }

    return "python";
  };

  const prismLanguage =
    getLanguage();

  const grammar =
    Prism.languages[
      prismLanguage
    ] ||
    Prism.languages.plaintext;

  const highlighted =
    Prism.highlight(
      code,
      grammar,
      prismLanguage
    );

  return (
    <div className="docs-code">

      <div className="code-toolbar">

        <span className="code-comment">
          {comment}
        </span>

        <button
          type="button"
          className="code-copy"
          onClick={copyCode}
          aria-label="Copy code"
          title={
            copied
              ? "Copied"
              : "Copy code"
          }
        >
          {copied ? (
            <Check size={17} />
          ) : (
            <Copy size={17} />
          )}
        </button>

      </div>

      <div className="code-scroll">

        <pre className="code-content">
          <code
            dangerouslySetInnerHTML={{
              __html: highlighted,
            }}
          />
        </pre>

      </div>

    </div>
  );
}

/* =========================================================
   VIDEO
========================================================= */

function VideoBlock({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  return (
    <div className="video-section">

      <div className="video-heading">

        <div className="video-heading-left">

          <div className="video-icon">
            <Play size={13} />
          </div>

          <span>
            {title}
          </span>

        </div>

      </div>

      <video
        className="documentation-video"
        controls
        preload="metadata"
      >
        <source
          src={src}
          type="video/mp4"
        />

        Your browser does not support
        the video element.
      </video>

    </div>
  );
}

/* =========================================================
   APP
========================================================= */

function App() {
  const [activeSection, setActiveSection] =
    useState("overview");

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [versionOpen, setVersionOpen] =
    useState(false);

  /* -------------------------------------------------------
     SECTION OBSERVER
  ------------------------------------------------------- */

  useEffect(() => {
    const observer =
      new IntersectionObserver(
        (entries) => {
          const visible =
            entries
              .filter(
                (entry) =>
                  entry.isIntersecting
              )
              .sort(
                (a, b) =>
                  b.intersectionRatio -
                  a.intersectionRatio
              );

          if (visible.length) {
            setActiveSection(
              visible[0].target.id
            );
          }
        },
        {
          rootMargin:
            "-120px 0px -60% 0px",
          threshold: [
            0.1,
            0.25,
            0.5,
          ],
        }
      );

    sections.forEach(
      ({ id }) => {
        const element =
          document.getElementById(id);

        if (element) {
          observer.observe(element);
        }
      }
    );

    return () =>
      observer.disconnect();
  }, []);


  useEffect(() => {
  const hash = window.location.hash;

  if (!hash) return;

  const id = decodeURIComponent(
    hash.substring(1)
  );

  const timer = window.setTimeout(() => {
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      setActiveSection(id);
    }
  }, 100);

  return () => {
    window.clearTimeout(timer);
  };
}, []);

  /* -------------------------------------------------------
     NAVIGATION
  ------------------------------------------------------- */

  const goToSection = (
    id: string
  ) => {
    setActiveSection(id);
    setMobileOpen(false);

    window.history.replaceState(
      null,
      "",
      `#${id}`
    );

    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  return (
    <div className="docs-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="docs-header">

        <div className="header-left">

          <a
            href="/"
            className="brand"
          >
            <img
              src="https://raw.githubusercontent.com/Narasimha440/mlsentinal/main/logo.png"
              alt="MLSentinel"
              className="docs-logo"
            />
          </a>

          <div className="header-divider" />

          <span className="header-title">
            Documentation
          </span>

        </div>

        <div className="header-right">

          {/* VERSION */}

          <div className="version-wrapper">

            <button
              type="button"
              className="version-button"
              onClick={() =>
                setVersionOpen(
                  !versionOpen
                )
              }
            >
              <span>
                {VERSION}
              </span>

              <ChevronDown
                size={14}
                className={
                  versionOpen
                    ? "rotate-icon"
                    : ""
                }
              />

            </button>

            {versionOpen && (
              <div className="version-menu">

                <div className="version-current">

                  <span>
                    {VERSION}
                  </span>

                  <span className="current-label">
                    Current
                  </span>

                </div>

              </div>
            )}

          </div>

          {/* SEARCH */}

          <button
            type="button"
            className="header-icon-button"
            aria-label="Search"
          >
            <Search size={17} />
          </button>

          {/* DASHBOARD */}

          <a
            href="https://mlsentinel.dev"
            target="_blank"
            rel="noreferrer"
            className="header-link"
          >
            Dashboard
          </a>

          {/* GITHUB */}

          <a
            href="https://github.com/Narasimha440/mlsentinal"
            target="_blank"
            rel="noreferrer"
            className="header-github"
            aria-label="GitHub"
          >
            <GithubIcon />
          </a>

          {/* MOBILE */}

          <button
            type="button"
            className="mobile-menu-button"
            onClick={() =>
              setMobileOpen(
                !mobileOpen
              )
            }
          >
            {mobileOpen ? (
              <X size={18} />
            ) : (
              <Menu size={18} />
            )}
          </button>

        </div>

      </header>

      {/* =================================================
          LAYOUT
      ================================================= */}

      <div className="docs-layout">

        {/* =================================================
            LEFT SIDEBAR
        ================================================= */}

        <aside
          className={`docs-sidebar ${
            mobileOpen
              ? "mobile-open"
              : ""
          }`}
        >

          <div className="sidebar-heading">
            DOCUMENTATION
          </div>

          <nav>
            {sections.map(
              (section) => {
                const Icon =
                  section.icon;

                return (
                  <button
                    key={section.id}
                    type="button"
                    className={`sidebar-link ${
                      activeSection ===
                      section.id
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      goToSection(
                        section.id
                      )
                    }
                  >
                    <Icon size={15} />

                    <span>
                      {section.label}
                    </span>

                  </button>
                );
              }
            )}
          </nav>

          <div className="sidebar-divider" />

          <div className="sidebar-heading">
            RESOURCES
          </div>

          <a
            href="https://mlsentinel.dev"
            target="_blank"
            rel="noreferrer"
            className="sidebar-external"
          >
            <ExternalLink size={14} />
            Dashboard
          </a>

          <a
            href="https://pypi.org/project/mlsentinel/"
            target="_blank"
            rel="noreferrer"
            className="sidebar-external"
          >
            <Package size={14} />
            PyPI
          </a>

          <a
            href="https://github.com/Narasimha440/mlsentinal"
            target="_blank"
            rel="noreferrer"
            className="sidebar-external"
          >
            <GithubIcon />
            GitHub
          </a>

        </aside>

        {/* =================================================
            MAIN
        ================================================= */}

        <main className="docs-content">

          {/* =================================================
              OVERVIEW
          ================================================= */}

          <section
            id="overview"
            className="docs-section"
          >

            <div className="eyebrow">
              MLSENTINEL SDK
            </div>

            <div className="version-badge">
              {VERSION}
            </div>

            <h1>
              MLSentinel Documentation
            </h1>

            <p className="lead">
              Python SDK and platform
              documentation for monitoring
              and evaluating machine learning
              models with MLSentinel.
            </p>

            <div className="intro-links">

              <button
                type="button"
                onClick={() =>
                  goToSection(
                    "installation"
                  )
                }
              >
                Get started
                <ArrowRight size={15} />
              </button>

              <a
                href="https://mlsentinel.dev"
                target="_blank"
                rel="noreferrer"
              >
                Open dashboard
                <ExternalLink size={14} />
              </a>

            </div>

            <div className="section-rule" />

            <h2>
              What is MLSentinel?
            </h2>

            <p>
              MLSentinel is a platform
              for monitoring machine
              learning models after
              training.
            </p>

            <p>
              The Python SDK allows your
              application to calculate
              evaluation metrics locally
              and send them to the
              MLSentinel API.
            </p>

            <p>
              Reports are associated
              with the model configured
              for your API key and can
              then be viewed from the
              MLSentinel dashboard.
            </p>

            <div className="simple-flow">

              <span>
                Your application
              </span>

              <ArrowRight size={15} />

              <span>
                MLSentinel SDK
              </span>

              <ArrowRight size={15} />

              <span>
                API
              </span>

              <ArrowRight size={15} />

              <span>
                Dashboard
              </span>

            </div>

          </section>

          {/* =================================================
              INSTALLATION
          ================================================= */}

          <section
            id="installation"
            className="docs-section"
          >

            <div className="section-number">
              01
            </div>

            <h2>
              Installation
            </h2>

            <p>
              MLSentinel supports Python
              3.9 and newer. Install the
              SDK directly from PyPI.
            </p>

            <CodeBlock
              language="Shell"
              comment="// install the MLSentinel SDK"
              code={`pip install mlsentinel`}
            />

            <h3>
              Create the client
            </h3>

            <p>
              After installing the package,
              import <code>MLDoc</code> and
              create a client using the API
              key generated from your
              dashboard.
            </p>

            <CodeBlock
              code={`from mlsentinel import MLDoc

client = MLDoc("YOUR_API_KEY")`}
            />

            <div className="explanation">

              <div className="explanation-title">
                <Code2 size={15} />
                What this does
              </div>

              <p>
                <code>MLDoc</code> is the
                main client used to
                communicate with the
                MLSentinel API.
              </p>

              <p>
                The API key authenticates
                the request and determines
                which model receives the
                report.
              </p>

            </div>

          </section>

          {/* =================================================
              DASHBOARD
          ================================================= */}

          <section
            id="dashboard"
            className="docs-section"
          >

            <div className="section-number">
              02
            </div>

            <h2>
              Dashboard
            </h2>

            <p>
              The dashboard is where you
              create your workspace,
              projects, models and API
              keys.
            </p>

            <div className="steps">

              <div className="step">
                <span>01</span>

                <div>
                  <strong>
                    Create your account
                  </strong>

                  <p>
                    Sign in to the
                    MLSentinel dashboard.
                  </p>
                </div>
              </div>

              <div className="step">
                <span>02</span>

                <div>
                  <strong>
                    Create a workspace
                  </strong>

                  <p>
                    Create the workspace
                    where your ML projects
                    will be stored.
                  </p>
                </div>
              </div>

              <div className="step">
                <span>03</span>

                <div>
                  <strong>
                    Create a project
                  </strong>

                  <p>
                    Create a project for
                    the ML application you
                    want to monitor.
                  </p>
                </div>
              </div>

              <div className="step">
                <span>04</span>

                <div>
                  <strong>
                    Add your model
                  </strong>

                  <p>
                    Add the model that will
                    receive evaluation
                    reports.
                  </p>
                </div>
              </div>

            </div>

            <VideoBlock
              title="Creating a workspace"
              src="https://github.com/user-attachments/assets/5de2396d-56cc-4770-9943-ac4be3efa05e"
            />

            <VideoBlock
              title="Creating a project"
              src="https://github.com/user-attachments/assets/cfe1eb92-84fa-4578-87dc-f3ae4d09942d"
            />

            <VideoBlock
              title="Creating a model"
              src="https://github.com/user-attachments/assets/a2aed00f-c27c-4616-9eae-77285fe4e9c1"
            />

          </section>

          {/* =================================================
              API KEYS
          ================================================= */}

          <section
            id="api-keys"
            className="docs-section"
          >

            <div className="section-number">
              03
            </div>

            <h2>
              API Keys
            </h2>

            <p>
              Every SDK request requires
              an API key. An API key is
              associated with a model when
              you create it from the
              dashboard.
            </p>

            <h3>
              Create an API key
            </h3>

            <div className="steps">

              <div className="step">
                <span>01</span>

                <div>
                  <strong>
                    Open API Keys
                  </strong>

                  <p>
                    Open API Keys from
                    the Developer section.
                  </p>
                </div>
              </div>

              <div className="step">
                <span>02</span>

                <div>
                  <strong>
                    Click Create API Key
                  </strong>

                  <p>
                    Give the key a label
                    so you can identify
                    it later.
                  </p>
                </div>
              </div>

              <div className="step">
                <span>03</span>

                <div>
                  <strong>
                    Select a model
                  </strong>

                  <p>
                    Select the model that
                    should receive reports
                    from this API key.
                  </p>
                </div>
              </div>

              <div className="step">
                <span>04</span>

                <div>
                  <strong>
                    Copy your key
                  </strong>

                  <p>
                    Copy the generated
                    key and store it
                    securely.
                  </p>
                </div>
              </div>

            </div>

            <VideoBlock
              title="Open API Keys"
              src="https://github.com/user-attachments/assets/1a82d46b-0766-4840-9069-7d95b689e31b"
            />

            <VideoBlock
              title="Add a key label"
              src="https://github.com/user-attachments/assets/71291ac9-57d8-4f10-b307-7f66e84fa163"
            />

            <VideoBlock
              title="Select the model"
              src="https://github.com/user-attachments/assets/7dcdc0b7-1429-4f6d-9fc5-14327ee3d7ef"
            />

            <VideoBlock
              title="Copy the API key"
              src="https://github.com/user-attachments/assets/368a1f4e-0cff-4006-9c5c-46e8f5e53186"
            />

            <div className="warning-box">

              <div className="warning-title">
                <ShieldCheck size={16} />
                Keep your API key private
              </div>

              <p>
                Never commit your API key
                to GitHub or place it in
                publicly accessible source
                code.
              </p>

            </div>

          </section>

          {/* =================================================
              MLDOC
          ================================================= */}

          <section
            id="ml-doc"
            className="docs-section"
          >

            <div className="section-number">
              04
            </div>

            <h2>
              MLDoc
            </h2>

            <p>
              <code>MLDoc</code> is the
              main client class provided
              by the MLSentinel SDK.
            </p>

            <CodeBlock
              code={`from mlsentinel import MLDoc

client = MLDoc("YOUR_API_KEY")`}
            />

            <div className="explanation">

              <div className="explanation-title">
                <Code2 size={15} />
                Line by line
              </div>

              <p>
                <code>
                  from mlsentinel import MLDoc
                </code>{" "}
                imports the SDK client.
              </p>

              <p>
                <code>
                  MLDoc("YOUR_API_KEY")
                </code>{" "}
                creates an authenticated
                MLSentinel client.
              </p>

            </div>

            <h3>
              Check the installed version
            </h3>

            <CodeBlock
              comment="// check the installed SDK version"
              code={`print(client.version())`}
            />

          </section>

          {/* =================================================
              MANUAL REPORTS
          ================================================= */}

          <section
            id="manual-reports"
            className="docs-section"
          >

            <div className="section-number">
              05
            </div>

            <h2>
              Manual Reports
            </h2>

            <p>
              Use <code>doc_report()</code>
              when you want to explicitly
              provide the project, model
              and evaluation metrics.
            </p>

            <CodeBlock
              code={`from mlsentinel import MLDoc

client = MLDoc("YOUR_API_KEY")

response = client.doc_report(
    project="Spam Detector",
    model="Random Forest",
    metrics={
        "accuracy": 0.95,
        "precision": 0.94,
        "recall": 0.93,
        "f1_score": 0.935,
        "roc_auc": 0.98,
        "val_loss": 0.18,
    },
)

print(response)`}
            />

            <div className="explanation">

              <div className="explanation-title">
                <Code2 size={15} />
                What happens here?
              </div>

              <p>
                Your application provides
                the project and model
                names together with the
                evaluation metrics.
              </p>

              <p>
                The SDK validates the
                payload locally before
                sending it to the
                MLSentinel API.
              </p>

              <p>
                The API then stores the
                report for the selected
                model.
              </p>

            </div>

          </section>

          {/* =================================================
              AUTO REPORTS
          ================================================= */}

          <section
            id="auto-reports"
            className="docs-section"
          >

            <div className="section-number">
              06
            </div>

            <h2>
              Auto Reports
            </h2>

            <p>
              Auto reports make reporting
              simpler when your API key
              is already associated with
              a model.
            </p>

            <p>
              You do not need to provide
              the project or model on
              every request. MLSentinel
              uses the model configured
              for your API key.
            </p>

            <h3>
              Create the client
            </h3>

            <CodeBlock
              code={`from mlsentinel import MLDoc

client = MLDoc("YOUR_API_KEY")`}
            />

            <h3>
              Send the report
            </h3>

            <CodeBlock
              code={`response = client.auto_report(
    metrics={
        "accuracy": 0.95,
        "precision": 0.94,
        "recall": 0.93,
        "f1_score": 0.935,
        "roc_auc": 0.98,
        "val_loss": 0.18,
    }
)

print(response)`}
            />

            <div className="explanation">

              <div className="explanation-title">
                <Server size={15} />
                How auto reports work
              </div>

              <p>
                Your ML application
                calculates its evaluation
                metrics.
              </p>

              <p>
                <code>auto_report()</code>
                sends those metrics using
                your API key.
              </p>

              <p>
                The backend finds the model
                associated with that API
                key and stores the report.
              </p>

            </div>

            <div className="simple-flow">

              <span>
                Model evaluation
              </span>

              <ArrowRight size={15} />

              <span>
                auto_report()
              </span>

              <ArrowRight size={15} />

              <span>
                API key
              </span>

              <ArrowRight size={15} />

              <span>
                Selected model
              </span>

              <ArrowRight size={15} />

              <span>
                Dashboard
              </span>

            </div>

          </section>

          {/* =================================================
              DATA QUALITY
          ================================================= */}

          <section
            id="data-quality"
            className="docs-section"
          >

            <div className="section-number">
              07
            </div>

            <h2>
              Data Quality
            </h2>

            <p>
              The SDK can generate a
              data-quality summary from
              a pandas DataFrame.
            </p>

            <CodeBlock
              code={`import pandas as pd

from mlsentinel import MLDoc

df = pd.read_csv("creditcard.csv")

client = MLDoc("YOUR_API_KEY")

response = client.report_data_quality(
    project="Loan Prediction",
    model="ResNet50",
    dataframe=df,
)

print(response)`}
            />

            <div className="explanation">

              <div className="explanation-title">
                <Code2 size={15} />
                What this does
              </div>

              <p>
                The SDK receives the
                DataFrame and creates
                a local data-quality
                summary.
              </p>

              <p>
                The summary is then sent
                to the MLSentinel platform.
              </p>

            </div>

            <p>
              This feature requires
              <code>pandas</code> and
              <code>numpy</code>.
            </p>

          </section>

          {/* =================================================
              VALIDATION
          ================================================= */}

          <section
            id="validation"
            className="docs-section"
          >

            <div className="section-number">
              08
            </div>

            <h2>
              Validation
            </h2>

            <p>
              Reports are validated
              locally before the SDK
              sends them to the API.
            </p>

            <div className="metric-table">

              <div className="metric-row metric-header">
                <span>
                  Metric
                </span>

                <span>
                  Accepted value
                </span>
              </div>

              {[
                [
                  "accuracy",
                  "Number from 0 to 1",
                ],
                [
                  "precision",
                  "Number from 0 to 1",
                ],
                [
                  "recall",
                  "Number from 0 to 1",
                ],
                [
                  "f1_score",
                  "Number from 0 to 1",
                ],
                [
                  "roc_auc",
                  "Number from 0 to 1",
                ],
                [
                  "val_loss",
                  "Number greater than or equal to 0",
                ],
              ].map(
                ([metric, value]) => (
                  <div
                    className="metric-row"
                    key={metric}
                  >
                    <code>
                      {metric}
                    </code>

                    <span>
                      {value}
                    </span>
                  </div>
                )
              )}

            </div>

          </section>

          {/* =================================================
              ERRORS
          ================================================= */}

          <section
            id="errors"
            className="docs-section"
          >

            <div className="section-number">
              09
            </div>

            <h2>
              Errors
            </h2>

            <p>
              The SDK provides dedicated
              exception types so your
              application can handle
              failures cleanly.
            </p>

            <div className="error-table">

              <div className="error-row error-header">
                <span>
                  Situation
                </span>

                <span>
                  Exception
                </span>
              </div>

              <div className="error-row">
                <span>
                  Invalid project,
                  model or metrics
                </span>

                <code>
                  ProjectValidationError,
                  ModelValidationError,
                  MetricValidationError
                </code>
              </div>

              <div className="error-row">
                <span>
                  Invalid API key
                </span>

                <code>
                  InvalidAPIKeyError
                </code>
              </div>

              <div className="error-row">
                <span>
                  Authentication failure
                </span>

                <code>
                  AuthenticationError
                </code>
              </div>

              <div className="error-row">
                <span>
                  Connection failure
                </span>

                <code>
                  MLSentinalConnectionError
                </code>
              </div>

              <div className="error-row">
                <span>
                  Unexpected API response
                </span>

                <code>
                  MLSentinalServerError
                </code>
              </div>

            </div>

            <h3>
              Handle errors
            </h3>

            <CodeBlock
              code={`from mlsentinel import MLDoc
from mlsentinel.exceptions import MLSentinelError

client = MLDoc("YOUR_API_KEY")

try:
    response = client.doc_report(
        project="Spam Detector",
        model="Random Forest",
        metrics={
            "accuracy": 0.95,
        },
    )

except MLSentinelError as error:
    print(error.code)
    print(error.message)`}
            />

          </section>

          {/* =================================================
              API REFERENCE
          ================================================= */}

          <section
            id="reference"
            className="docs-section"
          >

            <div className="section-number">
              10
            </div>

            <h2>
              API Reference
            </h2>

            <div className="api-method">

              <div className="method-title">
                MLDoc(api_key, check_version=True)
              </div>

              <p>
                Creates an authenticated
                MLSentinel client.
              </p>

            </div>

            <div className="api-method">

              <div className="method-title">
                client.doc_report(
                project, model, metrics)
              </div>

              <p>
                Sends a model evaluation
                report with explicit project
                and model information.
              </p>

            </div>

            <div className="api-method">

              <div className="method-title">
                client.auto_report(metrics)
              </div>

              <p>
                Sends metrics to the model
                associated with the API key.
              </p>

            </div>

            <div className="api-method">

              <div className="method-title">
                client.report_data_quality(
                project, model, dataframe)
              </div>

              <p>
                Creates and sends a
                data-quality summary.
              </p>

            </div>

            <div className="api-method">

              <div className="method-title">
                client.version()
              </div>

              <p>
                Returns the installed
                SDK version.
              </p>

            </div>

          </section>

          {/* =================================================
              BOTTOM NAV
          ================================================= */}

          <div className="docs-bottom-navigation">

            <button
              type="button"
              onClick={() =>
                goToSection(
                  "overview"
                )
              }
            >
              ← Overview
            </button>

            <button
              type="button"
              onClick={() =>
                goToSection(
                  "installation"
                )
              }
            >
              Installation →
            </button>

          </div>

        </main>

        {/* =================================================
            RIGHT SIDEBAR
        ================================================= */}

        <aside className="right-sidebar">

          <div className="right-title">
            ON THIS PAGE
          </div>

          <div className="right-active">
            {
              sections.find(
                (section) =>
                  section.id ===
                  activeSection
              )?.label
            }
          </div>

          <div className="right-divider" />

          <a href="#overview">
            Overview
          </a>

          <a href="#installation">
            Installation
          </a>

          <a href="#dashboard">
            Dashboard
          </a>

          <a href="#api-keys">
            API Keys
          </a>

          <a href="#ml-doc">
            MLDoc
          </a>

          <a href="#manual-reports">
            Manual Reports
          </a>

          <a href="#auto-reports">
            Auto Reports
          </a>

          <a href="#data-quality">
            Data Quality
          </a>

          <a href="#validation">
            Validation
          </a>

          <a href="#errors">
            Errors
          </a>

          <a href="#reference">
            API Reference
          </a>

        </aside>

      </div>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="docs-footer">

        <div className="footer-main">

          <div className="footer-intro">

            <img
              src="https://raw.githubusercontent.com/Narasimha440/mlsentinal/main/logo.png"
              alt="MLSentinel"
              className="footer-logo"
            />

            <h2>
              Build and monitor
              <br />
              with MLSentinel.
            </h2>

            <p>
              Developer documentation
              for the MLSentinel SDK
              and platform.
            </p>

          </div>

          <div className="footer-links">

            <div className="footer-column">

              <div className="footer-heading">
                DOCUMENTATION
              </div>

              <a href="#overview">
                Overview
              </a>

              <a href="#installation">
                Installation
              </a>

              <a href="#api-keys">
                API Keys
              </a>

              <a href="#auto-reports">
                Auto Reports
              </a>

              <a href="#reference">
                API Reference
              </a>

            </div>

            <div className="footer-column">

              <div className="footer-heading">
                CONNECT
              </div>

              <a
                href="https://mlsentinel.dev"
                target="_blank"
                rel="noreferrer"
              >
                Dashboard
              </a>

              <a
                href="https://github.com/Narasimha440/mlsentinal"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>

              <a
                href="https://pypi.org/project/mlsentinel/"
                target="_blank"
                rel="noreferrer"
              >
                PyPI
              </a>

            </div>

          </div>

        </div>

        <div className="footer-bottom">

          <span>
            © 2026 MLSentinel.
            All rights reserved.
          </span>

          <span className="footer-version">
            {VERSION}
          </span>

          <div className="footer-legal">

            <a href="#">
              Privacy Policy
            </a>

            <span>
              ·
            </span>

            <a href="#">
              Terms of Use
            </a>

          </div>

        </div>

      </footer>

    </div>
  );
}

export default App;